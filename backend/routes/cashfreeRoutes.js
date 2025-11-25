const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');
const crypto = require("crypto");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

require('dotenv').config();

// CASHFREE CONFIG
const APP_ID = process.env.CASHFREE_APP_ID;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.CASHFREE_WEBHOOK_SECRET;

const BASE_URL =
  process.env.CASHFREE_ENV === "PROD"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

// EMAIL CONFIG
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_ID,
    pass: process.env.MAIL_PASS
  }
});

/*
=========================================================
CREATE ORDER  (PENDING ORDER REUSE + NEW ORDER)
=========================================================
*/
router.post("/create-order", async (req, res) => {
  try {
    const {
      amount,
      userId,
      planName,
      customerName,
      customerEmail,
      customerPhone
    } = req.body;

    if (!APP_ID || !SECRET_KEY) {
      return res.status(500).json({ message: "Cashfree keys missing" });
    }

    if (!amount || !userId || !planName || !customerEmail) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // 🔥 CHECK EXISTING PENDING ORDER
    const existingPending = await Order.findOne({
      userId,
      planName,
      status: "pending"
    });

    if (existingPending) {
      try {
        const checkRes = await axios.get(
          `${BASE_URL}/orders/${existingPending.orderId}`,
          {
            headers: {
              "x-client-id": APP_ID,
              "x-client-secret": SECRET_KEY,
              "x-api-version": "2023-08-01",
            },
          }
        );

        if (checkRes.data.order_status === "ACTIVE") {
          return res.status(200).json({
            order_id: existingPending.orderId,
            payment_session_id: checkRes.data.payment_session_id
          });
        }

        await Order.updateOne(
          { _id: existingPending._id },
          { status: "expired" }
        );
      } catch (err) {
        console.log("Failed to reuse old order, creating new…");
      }
    }

    // 🔥 NEW ORDER
    const orderId = "ORDER_" + Date.now();

    const payload = {
      order_id: orderId,
      order_amount:Number(amount),
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_email: customerEmail,
        customer_phone: customerPhone || "9999999999",
      },
      order_meta: {
        return_url: `https://vistafluence.com/payment-status?order_id=${orderId}`,
      },
    };

    const cfRes = await axios.post(
      `${BASE_URL}/orders`,
      payload,
      {
        headers: {
          "x-client-id": APP_ID,
          "x-client-secret": SECRET_KEY,
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json",
        },
      }
    );

    await Order.create({
      userId,
      planName,
      amount,
      orderId,
      cfOrderId: cfRes.data.cf_order_id,
      status: "pending",
      customerName,
      customerEmail,
      customerPhone
    });

    return res.status(200).json({
      order_id: orderId,
      payment_session_id: cfRes.data.payment_session_id
    });

  } catch (err) {
    console.error("Order creation error:", err.response?.data || err.message);
    return res.status(500).json({
      message: "Order creation failed",
      error: err.response?.data || err.message
    });
  }
});



/*
=========================================================
CASHFREE WEBHOOK  (RAW BODY + SIGNATURE VERIFY)
=========================================================
*/
router.get("/webhook", (req, res) => {
  res.status(200).send("Webhook active");
});

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {

    try {
      const signature = req.headers["x-webhook-signature"];
      if (!signature) return res.status(400).send("Missing signature");

      const rawPayload = req.body; // buffer
      const expectedSignature = crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(rawPayload)
        .digest("base64");

      if (signature !== expectedSignature) {
        console.log("❌ Signature mismatch");
        return res.status(400).send("Invalid signature");
      }

      const data = JSON.parse(rawPayload.toString("utf8"));
      const orderId = data.data.order.order_id;
      const orderStatus = data.data.order.order_status;
      const paymentId = data.data.payment?.payment_id;

      if (orderStatus === "PAID") {
        const updatedOrder = await Order.findOneAndUpdate(
          { orderId },
          {
            status: "succeeded",
            paymentId,
            paidAt: new Date()
          },
          { new: true }
        );

        if (!updatedOrder) {
          return res.status(404).send("Order not found");
        }

        // 🔥 PDF GENERATION
        const pdfDir = path.join(__dirname, `../pdfs`);
        if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir);

        const pdfPath = path.join(pdfDir, `${orderId}.pdf`);
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(pdfPath));

        doc.fontSize(22).text("Payment Invoice", { align: "center" });
        doc.moveDown();

        doc.fontSize(14).text(`Order ID: ${orderId}`);
        doc.text(`Cashfree ID: ${updatedOrder.cfOrderId}`);
        doc.text(`Payment ID: ${paymentId}`);
        doc.text(`Plan: ${updatedOrder.planName}`);
        doc.text(`Amount: ₹${updatedOrder.amount}`);
        doc.text(`Customer: ${updatedOrder.customerName}`);
        doc.text(`Status: SUCCESS`);
        doc.text(`Paid At: ${updatedOrder.paidAt.toLocaleString()}`);

        doc.end();
        await new Promise(r => doc.on("end", r));

        // 🔥 SEND INVOICE EMAIL
        await transporter.sendMail({
          from: process.env.MAIL_ID,
          to: updatedOrder.customerEmail,
          subject: `Invoice - ${updatedOrder.planName}`,
          html: `
            <h2>Payment Successful</h2>
            <p>Your payment for <b>${updatedOrder.planName}</b> is successful.</p>
            <p><b>Order ID:</b> ${orderId}</p>
            <p><b>Amount:</b> ₹${updatedOrder.amount}</p>
          `,
          attachments: [{ filename: `${orderId}.pdf`, path: pdfPath }]
        });

        console.log("Invoice Sent:", orderId);
      } else {
        await Order.findOneAndUpdate(
          { orderId },
          { status: "failed" }
        );
      }

      return res.status(200).send("OK");

    } catch (err) {
      console.error("Webhook Error:", err);
      return res.status(200).send("Webhook processing error");
    }
  }
);

router.get('/check-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId })
      .select("orderId status amount planName paidAt");

    if (!order) return res.status(404).json({ message: "Order not found" });

    return res.status(200).json(order);

  } catch (err) {
    return res.status(500).send(err.message);
  }
});

router.get('/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);

  } catch (err) {
    return res.status(500).send(err.message);
  }
});

router.get('/download-invoice/:orderId', async (req, res) => {
  try {
    const pdfPath = path.join(__dirname, `../pdfs/${req.params.orderId}.pdf`);

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.download(pdfPath);

  } catch (err) {
    return res.status(500).send(err.message);
  }
});


module.exports = router;
