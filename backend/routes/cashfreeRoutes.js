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
    ? "https://api.cashfree.com/pg" // Production API
    : "https://sandbox.cashfree.com/pg"; // Sandbox API

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

    const orderId = "ORDER_" + Date.now();
    const amountInPaise = Math.round(amount * 100); // Cashfree को पैसे में राशि चाहिए (INR के लिए)

    const payload = {
      order_id: orderId,
      order_amount: amount, 
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
    
        customer_email: customerEmail || "default@example.com", 
        customer_phone: customerPhone || "9999999999", 
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

    // 2. Database में ऑर्डर को 'pending' स्थिति में सहेजें
    await Order.create({
      userId,
      planName,
      amount,
      orderId: orderId, // Database orderId
      cfOrderId: response.data.cf_order_id, // Cashfree का order ID
      status: "pending"
    });
    
    // 3. Payment Session ID (PSI) को फ्रंटएंड को वापस भेजें
    res.status(200).json({ 
        order_id: orderId,
        payment_session_id: response.data.payment_session_id // यही फ्रंटएंड को चाहिए
    });

  } catch (error) {
    console.error("Cashfree Order Creation Failed:", error.response?.data || error.message);
    res.status(500).json({ message: "Order creation failed", details: error.response?.data || error.message });
  }
});


router.post("/webhook", express.json({ type: "application/json" }), async (req, res) => {
    const event = req.body;

    try {
        const orderId = event.data.order.order_id;
        const orderStatus = event.data.order.order_status;

        // Payment Details
        const payment = event.data.payment || {};

        const updateData = {
            status:
                orderStatus === "PAID"
                    ? "succeeded"
                    : orderStatus === "FAILED" || orderStatus === "USER_DROPPED"
                    ? "failed"
                    : "pending",

            // Save full payment details
            paymentId: payment.payment_id || null,
            paymentMethod: payment.payment_method || null,
            bankReference: payment.bank_reference || null,
            paymentTime: payment.payment_time || null,
            paymentAmount: payment.payment_amount || null,
            paymentCurrency: payment.payment_currency || null,
        };

        // Update order in DB
        await Order.findOneAndUpdate({ orderId }, updateData, { new: true });

        console.log("Webhook updated: ", updateData);

        res.status(200).send("OK");
    } catch (error) {
        console.error("Webhook error: ", error);
        res.status(200).send("Webhook ACK but failed");
    }
});


router.get('/orders/:userId', async (req, res) => {
  try {
      const { userId } = req.params;
      const orders = await Order.find({ userId }).sort({ createdAt: -1 });
      res.status(200).json(orders);
  } catch (error) {
      res.status(500).send("Error fetching orders: " + error.message);
  }
});

module.exports = router;