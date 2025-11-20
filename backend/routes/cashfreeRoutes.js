const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');
require('dotenv').config();

const APP_ID = process.env.CASHFREE_APP_ID;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.CASHFREE_WEBHOOK_SECRET;

const BASE_URL =
  process.env.CASHFREE_ENV === "PROD"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

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
      return res.status(500).json({ message: "Cashfree keys not configured." });
  	}

    // customerEmail is required in your updated Schema
    if (!amount || !userId || !planName || !customerEmail) { 
      return res.status(400).json({ message: "Required fields missing." });
    }

    const orderId = "ORDER_" + Date.now();

    // 1. Payload for Cashfree (Correctly uses all customer details)
    const payload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        // Note: Since customerEmail is required in schema now, we can remove || 'default@...' fallback here
        customer_email: customerEmail, 
        customer_phone: customerPhone || "9999999999"
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

    // 2. Database Save (UPDATED to include customer details)
    await Order.create({
      userId,
      planName,
      amount,
      orderId,
      cfOrderId: response.data.cf_order_id,
      status: "pending",
        // Naye fields jod diye gaye hain
      customerName,
      customerEmail,
      customerPhone
    });

    return res.status(200).json({
      order_id: orderId,
      payment_session_id: response.data.payment_session_id
    });

  } catch (error) {
    console.error("❌ Cashfree Order Creation Failed:", error.response?.data || error.message);
    return res.status(500).json({
      message: "Order creation failed",
      details: error.response?.data || error.message
    });
  }
});

// ======================
// WEBHOOK HANDLER
// ======================
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const signature = req.headers["x-webhook-signature"];

    if (!signature) {
      console.log("❌ Missing signature");
      return res.status(400).send("Missing signature");
    }

    // Convert raw buffer to string
    const payload = req.body.toString("utf8");

    // Calculate signature
    const expectedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.log("❌ Invalid signature, webhook rejected");
      return res.status(400).send("Invalid signature");
    }

    // Parse JSON manually (because express.raw is used)
    const event = JSON.parse(payload);

    const orderId = event.data?.order?.order_id;
    const orderStatus = event.data?.order?.order_status;
    const paymentId = event.data?.payment?.payment_id;

    if (!orderId) {
      console.log("❌ Invalid webhook: missing orderId");
      return res.status(200).send("Webhook received");
    }

    if (orderStatus === "PAID") {
      await Order.findOneAndUpdate(
        { orderId },
        { status: "succeeded", paymentId },
        { new: true }
      );
      console.log(`✅ PAYMENT SUCCESS: Order ${orderId}`);
    } 
    else if (orderStatus === "FAILED" || orderStatus === "USER_DROPPED") {
      await Order.findOneAndUpdate(
        { orderId },
        { status: "failed" }
      );
      console.log(`❌ PAYMENT FAILED: Order ${orderId}`);
    }

    return res.status(200).send("Webhook processed");

  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).send("Webhook error");
  }
});

// ======================
// GET USER ORDERS
// ======================
router.get('/orders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);

  } catch (error) {
    return res.status(500).send("Error fetching orders: " + error.message);
  }
});


module.exports = router;
