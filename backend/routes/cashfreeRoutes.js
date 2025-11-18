const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');
require('dotenv').config();

const APP_ID = process.env.CASHFREE_APP_ID;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

const BASE_URL =
  process.env.CASHFREE_ENV === "PROD"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";


// CREATE ORDER
router.post("/create-order", async (req, res) => {
  try {
    const { amount, userId, planName } = req.body;

    const orderId = "ORDER_" + Date.now();

    const payload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_email: "test@example.com",
        customer_phone: "9999999999"
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

    const paymentLink = response.data.payment_link;

    await Order.create({
      userId,
      planName,
      amount,
      orderId,
      status: "pending"
    });

    res.status(200).json({ payment_link: paymentLink });

  } catch (error) {
    console.log("Cashfree Error:", error.response?.data || error);
    res.status(500).json({ message: "Order creation failed" });
  }
});


// VERIFY PAYMENT
router.post("/verify", async (req, res) => {
  try {
    const { orderId } = req.body;

    const response = await axios.get(
      `${BASE_URL}/orders/${orderId}`,
      {
        headers: {
          "x-client-id": APP_ID,
          "x-client-secret": SECRET_KEY,
          "x-api-version": "2023-08-01"
        }
      }
    );

    const status = response.data.order_status;

    if (status === "PAID") {
      await Order.findOneAndUpdate(
        { orderId },
        { status: "succeeded" }
      );
      return res.status(200).json({ message: "Payment Verified" });
    }

    await Order.findOneAndUpdate(
      { orderId },
      { status: "failed" }
    );

    res.status(400).json({ message: "Payment Failed" });

  } catch (error) {
    console.log("Verify Error:", error.response?.data || error);
    res.status(500).json({ message: "Verification failed" });
  }
});


// GET ORDERS
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
