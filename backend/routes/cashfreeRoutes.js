// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();

const axios = require("axios");
const crypto = require("crypto");
const Order = require("../models/Order");
const { v4: uuidv4 } = require("uuid");

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const API_KEY = process.env.PHONEPE_API_KEY; // Salt key
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || 1;
const isProduction = process.env.NODE_ENV === "production";

const PHONEPE_API_URL = isProduction
  ? "https://api.phonepe.com/apis/pg/v1/pay"
  : "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

// ------------------- CREATE PAYMENT -------------------
router.post("/create-payment", async (req, res) => {
  try {
    const { amount, name, email, phone, plan } = req.body;
    if (!amount || !name || !email || !phone || !plan)
      return res.status(400).json({ error: "Missing required fields" });

    const orderId = uuidv4().replace(/-/g, "").toUpperCase();
    const amountInPaise = amount * 100;

    const body = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: orderId,
      amount: amountInPaise.toString(),
      redirectUrl: `https://vistafluence.com/payment-status?order_id=${orderId}`,
      callbackUrl: "https://vistafluence.com/api/payment/webhook",
      mobileNumber: phone,
      paymentInstrument: { type: "PAY_PAGE" },
    };

    const bodyString = JSON.stringify(body);
    const bodyBase64 = Buffer.from(bodyString).toString("base64");
    const textToHash = `${bodyBase64}/pg/v1/pay`;
    const checksum = crypto.createHash("sha256")
      .update(textToHash + API_KEY)
      .digest("hex") + `###${SALT_INDEX}`;

    const response = await axios.post(
      PHONEPE_API_URL,
      bodyBase64,
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "Accept": "application/json",
        },
      }
    );

    if (!response.data.success || !response.data.data?.instrumentResponse?.redirectInfo?.url)
      return res.status(500).json({ error: "PhonePe Payment Init Failed" });

    await Order.create({
      userEmail: email,
      userName: name,
      userPhoneNo: phone,
      plan,
      amount,
      orderId,
      phonepeOrderId: null,
      transactionId: null,
      paymentStatus: "PENDING",
      responseData: response.data,
    });

    res.json({
      success: true,
      redirectUrl: response.data.data.instrumentResponse.redirectInfo.url,
      orderId,
    });
  } catch (err) {
    console.error("❌ Payment creation failed:", err.message);
    res.status(500).json({ error: "Payment creation failed" });
  }
});

// ------------------- WEBHOOK -------------------
router.post("/webhook", express.json({ type: "*/*" }), async (req, res) => {
  try {
    const signature = req.headers["x-verify"];
    if (!signature) return res.status(200).send();

    const payloadString = JSON.stringify(req.body);
    const textToHash = payloadString; // webhook signature validation may differ
    const calculatedChecksum = crypto.createHash("sha256")
      .update(textToHash + API_KEY)
      .digest("hex") + `###${SALT_INDEX}`;

    if (signature !== calculatedChecksum) {
      console.log("❌ Invalid webhook signature");
      return res.status(200).send();
    }

    const payload = req.body.data || req.body;
    const { merchantTransactionId, transactionId, state, orderId } = payload;

    const order = await Order.findOne({ orderId: merchantTransactionId });
    if (!order) return res.status(200).send();

    let paymentStatus = "PENDING";
    if (state === "COMPLETED") paymentStatus = "SUCCESS";
    else if (state === "FAILED") paymentStatus = "FAILED";

    await Order.findOneAndUpdate(
      { orderId: merchantTransactionId },
      { paymentStatus, phonepeOrderId: orderId, transactionId },
      { new: true }
    );

    console.log(`Webhook Updated: ${merchantTransactionId} → ${paymentStatus}`);
    res.status(200).send();
  } catch (err) {
    console.error("❌ Webhook Error:", err.message);
    res.status(200).send();
  }
});

// ------------------- STATUS CHECK -------------------
router.get("/status", async (req, res) => {
  try {
    const orderId = req.query.order_id;
    if (!orderId) return res.status(400).json({ error: "Missing orderId" });

    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.paymentStatus !== "PENDING") {
      return res.json({ orderId, amount: order.amount, status: order.paymentStatus, updated: true });
    }

    res.json({ orderId, status: "PENDING", updated: false });
  } catch (err) {
    console.error("❌ Status check failed:", err.message);
    res.status(500).json({ error: "Status check failed" });
  }
});

module.exports = router;
