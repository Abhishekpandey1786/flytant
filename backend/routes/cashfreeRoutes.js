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

// --- CASHFREE CONFIG ---
// सुनिश्चित करें कि .trim() का उपयोग किया गया है
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

    if (!APP_ID || !SECRET_KEY || !WEBHOOK_SECRET) {
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
        // सुनिश्चित करें कि return_url सही है और इसमें order_id शामिल है
        return_url: `https://vistafluence.com/payment-status?order_id={order_id}`, 
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
// WEBHOOK (Signature Check Simplified for Clarity)
// =========================================================
router.post(
  "/webhook",
  // यह महत्वपूर्ण है: raw body parser हमेशा पहले आना चाहिए
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const signature = req.headers["x-webhook-signature"];
      const version = req.headers["x-webhook-version"];
      const timestamp = req.headers["x-webhook-timestamp"];
      
      if (!signature || !version || !timestamp) {
        console.log("❌ Missing essential webhook headers (signature, version, or timestamp)");
        return res.status(400).send("Missing essential headers");
      }

      const rawPayload = req.body;
      if (!Buffer.isBuffer(rawPayload) || rawPayload.length === 0) {
        console.error("❌ Webhook body is missing or not a buffer");
        return res.status(400).send("Invalid payload");
      }
      
      // versioned scheme (Recommended by Cashfree for API 2023-08-01)
      // msg = timestamp + ":" + payload
      const msg = Buffer.concat([Buffer.from(timestamp + ":", "utf8"), rawPayload]);

      const expectedSignature = crypto.createHmac("sha256", WEBHOOK_SECRET)
        .update(msg)
        .digest("base64"); // Cashfree default is Base64

      console.log("Signature check:", {
        received: signature,
        expected: expectedSignature,
        match: signature === expectedSignature
      });

      // केवल एक ही सही सिग्नेचर चेक को रखें।
      if (signature !== expectedSignature) {
        console.log("❌ Signature mismatch! Check WEBHOOK_SECRET in .env file.");
        return res.status(400).send("Invalid signature");
      }

      const data = JSON.parse(rawPayload.toString("utf8"));
      console.log("✅ Webhook event received successfully:", data.event_type);

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

        const paidAt = new Date();
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
          paidAt
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
            <p>प्रिय ${customerName},</p>
            <p>आपका <b>${planName}</b> प्लान के लिए भुगतान सफलतापूर्वक पूरा हो गया है।</p>
            <p><b>ऑर्डर ID:</b> ${orderId}</p>
            <p><b>राशि:</b> ₹${amount}</p>
            <p>कृपया संलग्न (attached) चालान देखें।</p>
          `,
          attachments: [{ filename: `invoice_${orderId}.pdf`, path: pdfPath }]
        });

        console.log("✅ Invoice sent:", orderId);
      } else {
         console.log(`⚠️ Order ${orderId} status is ${orderStatus}. Not processing.`);
      }


      return res.status(200).send("OK");

    } catch (err) {
      console.error("❌ Webhook processing error:", err.message);
      return res.status(500).send("Webhook error");
    }
  }
);

// =========================================================
// STATUS & INVOICE ROUTES (No Changes Needed)
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