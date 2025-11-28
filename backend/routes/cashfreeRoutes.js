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

const APP_ID = (process.env.CASHFREE_APP_ID || "").trim();
const SECRET_KEY = (process.env.CASHFREE_SECRET_KEY || "").trim();
const WEBHOOK_SECRET = (process.env.CASHFREE_WEBHOOK_SECRET || "").trim();

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

// --- HELPER FUNCTION: PDF GENERATION ---
const generateInvoicePDF = async (orderData, pdfPath) => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(pdfPath));

  doc.fontSize(22).text("Payment Invoice", { align: "center" });
  doc.moveDown();

  doc.fontSize(14).text(`Order ID: ${orderData.orderId}`);
  doc.text(`Cashfree ID: ${orderData.cfOrderId}`);
  doc.text(`Payment ID: ${orderData.paymentId}`);
  doc.text(`Plan: ${orderData.planName}`);
  doc.text(`Amount: ₹${orderData.amount}`);
  doc.text(`Customer: ${orderData.customerName}`);
  doc.text(`Status: SUCCESS`);
  doc.text(`Paid At: ${orderData.paidAt.toLocaleString()}`);

  await new Promise((resolve, reject) => {
    doc.on("finish", resolve);
    doc.on("error", reject);
    doc.end();
  });
};

// =========================================================
// CREATE ORDER
// =========================================================
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

    const orderId = "ORDER_" + Date.now();

    const payload = {
      order_id: orderId,
      order_amount: Number(amount), // rupees only
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_email: customerEmail,
        customer_phone: customerPhone || "9999999999",
      },
      order_meta: {
        return_url: `https://vistafluence.com/payment-status?order_id=${orderId}`,
        custom_meta: {
          userId,
          planName,
          customerName,
        }
      },
    };

    console.log("👉 Sending payload to Cashfree:", payload);

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

    console.log("✅ Cashfree order created:", cfRes.data);

    return res.status(200).json({
      order_id: orderId,
      payment_session_id: cfRes.data.payment_session_id
    });

  } catch (err) {
    console.error("❌ Order creation error:", err.response?.data || err.message);
    return res.status(500).json({
      message: "Order creation failed",
      error: err.response?.data || err.message
    });
  }
});

// =========================================================
// WEBHOOK
// =========================================================
// =========================================================
// WEBHOOK
// =========================================================
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const signature = req.headers["x-webhook-signature"];
      const version = req.headers["x-webhook-version"];
      const timestamp = req.headers["x-webhook-timestamp"];

      if (!signature) {
        console.log("❌ Missing signature");
        return res.status(400).send("Missing signature");
      }

      const rawPayload = req.body;
      if (!Buffer.isBuffer(rawPayload)) {
        console.error("❌ Webhook body is not buffer");
        return res.status(400).send("Invalid payload");
      }

      // Compute signatures in multiple formats
      const sigLegacyBase64 = crypto.createHmac("sha256", WEBHOOK_SECRET)
        .update(rawPayload)
        .digest("base64");

      const sigLegacyHex = crypto.createHmac("sha256", WEBHOOK_SECRET)
        .update(rawPayload)
        .digest("hex");

      let sigVersionedBase64 = null;
      let sigAltBase64 = null;
      let sigVersionedHex = null;
      let sigAltHex = null;

      if (version && timestamp) {
        // versioned scheme: timestamp + ":" + payload
        const msg1 = Buffer.concat([Buffer.from(timestamp + ":", "utf8"), rawPayload]);
        sigVersionedBase64 = crypto.createHmac("sha256", WEBHOOK_SECRET)
          .update(msg1)
          .digest("base64");
        sigVersionedHex = crypto.createHmac("sha256", WEBHOOK_SECRET)
          .update(msg1)
          .digest("hex");

        // alternate scheme: payload + ":" + timestamp
        const msg2 = Buffer.concat([rawPayload, Buffer.from(":" + timestamp, "utf8")]);
        sigAltBase64 = crypto.createHmac("sha256", WEBHOOK_SECRET)
          .update(msg2)
          .digest("base64");
        sigAltHex = crypto.createHmac("sha256", WEBHOOK_SECRET)
          .update(msg2)
          .digest("hex");
      }

      console.log("Signature check:", {
        received: signature,
        sigLegacyBase64,
        sigLegacyHex,
        sigVersionedBase64,
        sigVersionedHex,
        sigAltBase64,
        sigAltHex
      });

      // Accept if any signature matches
      if (![sigLegacyBase64, sigLegacyHex, sigVersionedBase64, sigVersionedHex, sigAltBase64, sigAltHex].includes(signature)) {
        console.log("❌ Signature mismatch");
        return res.status(400).send("Invalid signature");
      }

      const data = JSON.parse(rawPayload.toString("utf8"));
      console.log("👉 Webhook event received:", data);

      const orderId = data.data.order.order_id;
      const cfOrderId = data.data.order.cf_order_id;
      const orderStatus = data.data.order.order_status;
      const paymentId = data.data.payment?.payment_id;
      const amount = data.data.order.order_amount;

      const customerEmail = data.data.customer_details.customer_email;
      const customerPhone = data.data.customer_details.customer_phone;

      const customMeta = data.data.order.order_meta.custom_meta || {};
      const { userId, planName, customerName } = customMeta;

      if (orderStatus === "PAID") {
        const exists = await Order.findOne({ orderId });
        if (exists) {
          console.log("Already processed");
          return res.status(200).send("OK");
        }

        const saved = await Order.create({
          userId,
          planName,
          amount,
          orderId,
          cfOrderId,
          paymentId,
          status: "succeeded",
          customerName,
          customerEmail,
          customerPhone,
          paidAt: new Date()
        });

        const pdfDir = path.join(__dirname, "../pdfs");
        if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir);

        const pdfPath = path.join(pdfDir, `${orderId}.pdf`);
        await generateInvoicePDF(saved, pdfPath);

        await transporter.sendMail({
          from: process.env.MAIL_ID,
          to: customerEmail,
          subject: `Invoice - ${planName}`,
          html: `
            <h2>Payment Successful</h2>
            <p>Your payment for <b>${planName}</b> is completed.</p>
            <p><b>Order ID:</b> ${orderId}</p>
            <p><b>Amount:</b> ₹${amount}</p>
          `,
          attachments: [{ filename: `${orderId}.pdf`, path: pdfPath }]
        });

        console.log("✅ Invoice sent:", orderId);
      }

      return res.status(200).send("OK");

    } catch (err) {
      console.error("Webhook error:", err);
      return res.status(500).send("Webhook error");
    }
  }
);

// =========================================================
// STATUS & INVOICE ROUTES
// =========================================================
router.get('/check-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId })
      .select("orderId status amount planName paidAt");
    if (!order) return res.status(404).json({ message: "Order not found or payment failed" });
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
