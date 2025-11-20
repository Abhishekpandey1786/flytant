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

const APP_ID = process.env.CASHFREE_APP_ID;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.CASHFREE_WEBHOOK_SECRET;

const BASE_URL =
  process.env.CASHFREE_ENV === "PROD"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";


// ======================
// CREATE ORDER
// ======================
router.post("/create-order", async (req, res) => {
  try {
    const { amount, userId, planName, customerName, customerEmail, customerPhone } = req.body;

    if (!APP_ID || !SECRET_KEY) {
      return res.status(500).json({ message: "Cashfree keys not configured." });
    }

    const orderId = "ORDER_" + Date.now();

    const payload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_email: customerEmail,
        customer_phone: customerPhone
      },
      order_meta: {
        return_url: `https://vistafluence.com/payment-status?order_id=${orderId}`
      }
    };

    const response = await axios.post(
      `${BASE_URL}/orders`,
      payload,
      {
        headers: {
          "x-client-id": APP_ID,
          "x-client-secret": SECRET_KEY,
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json"
        }
      }
    );

    await Order.create({
      userId,
      planName,
      amount,
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      cfOrderId: response.data.cf_order_id,
      status: "pending"
    });

    return res.status(200).json({
      order_id: orderId,
      payment_session_id: response.data.payment_session_id
    });

  } catch (error) {
    return res.status(500).json({
      message: "Order creation failed",
      details: error.response?.data || error.message
    });
  }
});


// ======================
// WEBHOOK HANDLER
// ======================
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const signature = req.headers["x-webhook-signature"];
      if (!signature) return res.status(400).send("Missing signature");

      const payload = req.body.toString("utf8");

      const expectedSignature = crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(payload)
        .digest("base64");

      if (signature !== expectedSignature) {
        console.log("❌ Signature mismatch");
        return res.status(400).send("Invalid signature");
      }

      const event = JSON.parse(payload);
      const orderId = event.data.order.order_id;
      const paymentId = event.data.payment?.payment_id;
      const orderStatus = event.data.order.order_status;

      let updatedOrder = await Order.findOne({ orderId });
      if (!updatedOrder) return res.status(404).send("Order not found");

      // ================
      // Payment Success
      // ================
      if (orderStatus === "PAID") {

        updatedOrder.status = "succeeded";
        updatedOrder.paymentId = paymentId;
        updatedOrder.paidAt = new Date();
        await updatedOrder.save();

        // -----------------------
        // Generate PDF
        // -----------------------
        const PDFDocument = require("pdfkit");
        const fs = require("fs");
        const path = require("path");

        const pdfPath = path.join(__dirname, `../pdfs/${orderId}.pdf`);
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(pdfPath));

        doc.fontSize(22).text("Payment Invoice", { align: "center" });
        doc.moveDown();
        doc.fontSize(14).text(`Order ID: ${orderId}`);
        doc.text(`Payment ID: ${paymentId}`);
        doc.text(`Amount: ₹${event.data.order.order_amount}`);
        doc.text(`Plan: ${updatedOrder.planName}`);
        doc.text(`Status: SUCCESS`);
        doc.text(`Date: ${new Date().toLocaleString()}`);
        doc.end();

        updatedOrder.invoiceUrl = `/pdfs/${orderId}.pdf`;
        await updatedOrder.save();

        // -----------------------
        // Email Invoice
        // -----------------------
        const nodemailer = require("nodemailer");
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.MAIL_ID,
            pass: process.env.MAIL_PASS
          }
        });

        await transporter.sendMail({
          from: process.env.MAIL_ID,
          to: updatedOrder.customerEmail,
          subject: "Payment Successful - Invoice",
          html: `
            <h2>Payment Successful</h2>
            <p><b>Order ID:</b> ${orderId}</p>
            <p><b>Plan:</b> ${updatedOrder.planName}</p>
            <p><b>Amount:</b> ₹${updatedOrder.amount}</p>
            <p>Your invoice is attached.</p>
          `,
          attachments: [{ filename: `${orderId}.pdf`, path: pdfPath }]
        });

        console.log("📄 Invoice generated & mailed");
      }

      return res.status(200).send("Webhook Processed");
    } catch (error) {
      console.error("Webhook Error:", error);
      return res.status(500).send("Webhook error");
    }
  }
);



// ======================
// GET USER ORDERS
// ======================
router.get('/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);
  } catch (error) {
    return res.status(500).send("Error fetching orders: " + error.message);
  }
});

module.exports = router;
