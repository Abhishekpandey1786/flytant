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


// ======================
// CREATE ORDER
// ======================
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

    if (!amount || !userId || !planName) {
      return res.status(400).json({ message: "Required fields missing." });
    }

    const orderId = "ORDER_" + Date.now();

    const payload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_email: customerEmail || "default@example.com",
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

    // Save order as pending
    await Order.create({
      userId,
      planName,
      amount,
      orderId,
      cfOrderId: response.data.cf_order_id,
      status: "pending"
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
router.post("/webhook", express.json({ type: 'application/json' }), async (req, res) => {

  const event = req.body;

  // Cashfree Order Details
  const orderId = event.data?.order?.order_id;
  const orderStatus = event.data?.order?.order_status;
  const paymentId = event.data?.payment?.payment_id;

  if (!orderId) {
    console.log("Invalid webhook: missing orderId");
    return res.status(200).send("Webhook received");
  }

  try {
    if (orderStatus === "PAID") {

      await Order.findOneAndUpdate(
        { orderId },
        {
          status: "succeeded",
          paymentId: paymentId
        },
        { new: true }
      );

      console.log(`✅ PAYMENT SUCCESS: Order ${orderId} updated.`);
    } 
    
    else if (orderStatus === "FAILED" || orderStatus === "USER_DROPPED") {

      await Order.findOneAndUpdate(
        { orderId },
        { status: "failed" }
      );

      console.log(`❌ PAYMENT FAILED: Order ${orderId}`);
    }

    return res.status(200).send("Webhook received successfully.");

  } catch (error) {
    console.error("Webhook Processing Error:", error);
    return res.status(200).send("Error processing webhook but acknowledged.");
  }
});


// ======================
// GET USER ORDERS
// ======================
router.get('/orders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ 
    userId, 
    status: "succeeded" 
}).sort({ createdAt: -1 });


  } catch (error) {
    return res.status(500).send("Error fetching orders: " + error.message);
  }
});


module.exports = router;
