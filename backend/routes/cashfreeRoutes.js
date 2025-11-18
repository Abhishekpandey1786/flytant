const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const Order = require('../models/Order');
require('dotenv').config();

// Environment Variables
const APP_ID = process.env.CASHFREE_APP_ID;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.CASHFREE_WEBHOOK_SECRET;

const BASE_URL =
  process.env.CASHFREE_ENV === "PROD"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

// ------------------ CREATE ORDER ------------------
router.post("/create-order", async (req, res) => {
  try {
    const { amount, userId, planName, customerName, customerEmail, customerPhone } = req.body;

    if (!customerEmail || !customerPhone) {
      return res.status(400).json({ message: "Email & Phone are required!" });
    }

    const orderId = "ORDER_" + Date.now();

    const payload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: "https://vistafluence.netlify.app/payment-success?order_id={order_id}"
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
      cfOrderId: response.data.cf_order_id,
      status: "pending"
    });

    res.status(200).json({
      order_id: orderId,
      payment_session_id: response.data.payment_session_id
    });

  } catch (error) {
    console.error("Order Creation Error:", error.response?.data || error);
    res.status(500).json({ message: "Order creation failed", error: error.response?.data });
  }
});

// ------------------ WEBHOOK ------------------
router.post("/webhook", async (req, res) => {
  try {
    const signature = req.headers["x-webhook-signature"];
    const bodyString = JSON.stringify(req.body);

    // Verify Signature
    const computedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(bodyString)
      .digest('base64');

    if (signature !== computedSignature) {
      console.log("❌ Invalid Webhook Signature");
      return res.status(400).send("Invalid signature");
    }

    const event = req.body;
    const orderId = event?.data?.order?.order_id;
    const orderStatus = event?.data?.order?.order_status;
    const paymentId = event?.data?.payment?.payment_id || null;

    if (!orderId) return res.status(200).send("No order_id found");

    if (orderStatus === "PAID") {
      await Order.findOneAndUpdate(
        { orderId },
        { status: "succeeded", paymentId },
        { new: true }
      );

      console.log("✅ Payment success updated:", orderId);
    }
    else if (["FAILED", "USER_DROPPED"].includes(orderStatus)) {
      await Order.findOneAndUpdate(
        { orderId },
        { status: "failed" }
      );
      console.log("❌ Payment failed:", orderId);
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(200).send("Acknowledged with error");
  }
});

// ------------------ GET ORDERS ------------------
router.get("/orders/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

module.exports = router;
