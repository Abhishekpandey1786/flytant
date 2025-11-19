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
      customerName,       // 👈 यूजर का नाम 
      customerEmail,      // 👈 यूजर की ईमेल
      customerPhone       // 👈 यूजर का फ़ोन
    } = req.body;

    if (!APP_ID || !SECRET_KEY) {
      return res.status(500).json({ message: "Cashfree keys not configured." });
    }

    if (!amount || !userId || !planName || !customerEmail || !customerPhone) {
      // 💡 ईमेल/फ़ोन को आवश्यक फ़ील्ड माना गया है
      return res.status(400).json({ message: "Required fields missing: amount, userId, planName, customerEmail, or customerPhone." });
    }
    
    // 1. राशि को फ्लोटिंग पॉइंट नंबर में बदलना (Amount Fix)
    const orderAmount = parseFloat(amount); 

    if (isNaN(orderAmount) || orderAmount <= 0) {
        console.error("❌ Invalid order amount received:", amount);
        return res.status(400).json({ message: "Invalid order amount provided." });
    }

    const orderId = "ORDER_" + Date.now();

    const payload = {
      order_id: orderId,
      order_amount: orderAmount, // ✅ Correct Float Amount
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_name: customerName || "Guest User", // 👈 नाम का उपयोग 
        customer_email: customerEmail,               // 👈 ईमेल का उपयोग 
        customer_phone: customerPhone                // 👈 फ़ोन का उपयोग 
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

    // Save order as pending in your database
    await Order.create({
      userId,
      planName,
      amount: orderAmount, // ✅ Correct Float Amount
      orderId,
      cfOrderId: response.data.cf_order_id,
      status: "pending",
      // 👈 यूजर की सारी इन्फॉर्मेशन डेटाबेस में सेव करें
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

// ---

// ======================
// WEBHOOK HANDLER (No major changes, ensures correct update)
// ======================
router.post("/webhook", express.json({ type: 'application/json' }), async (req, res) => {
  // **Highly Recommended:** Implement HMAC SHA-256 verification using WEBHOOK_SECRET here.
  
  const event = req.body;

  // Cashfree Order Details
  const orderId = event.data?.order?.order_id;
  const orderStatus = event.data?.order?.order_status;
  const paymentId = event.data?.payment?.payment_id;
  const paymentTime = event.data?.payment?.payment_time; // 👈 पेमेंट टाइम कैप्चर किया जा सकता है

  if (!orderId) {
    console.log("Invalid webhook: missing orderId");
    return res.status(200).send("Webhook received");
  }

  try {
    console.log(`Webhook Received for Order ${orderId}. Status: ${orderStatus}`);
    
    if (orderStatus === "PAID") {

      await Order.findOneAndUpdate(
        { orderId },
        {
          status: "succeeded",
          paymentId: paymentId,
          paymentTime: paymentTime // 👈 DB में अपडेट
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

// ---

// ======================
// GET USER ORDERS (No changes needed)
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