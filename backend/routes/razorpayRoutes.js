const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order'); // Order model import karein

// Razorpay Instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Endpoint 1: Order create karne ke liye
router.post('/order', async (req, res) => {
  try {
    const { amount, currency, planName, userId } = req.body;

    const options = {
      amount: amount, // Amount in paise
      currency: currency,
      receipt: 'receipt_order_' + Date.now(),
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    // Database mein ek naya order record banayein (pending status ke saath)
    const newOrder = new Order({
        userId,
        planName,
        amount,
        orderId: razorpayOrder.id,
        status: 'pending',
    });
    await newOrder.save();

    res.status(200).json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).send("Error creating order: " + error.message);
  }
});

// Endpoint 2: Payment signature verify karne ke liye
router.post('/verify', async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generatedSignature = hmac.digest('hex');

  if (generatedSignature === razorpay_signature) {
    try {
      // Database mein order ko 'succeeded' mark karein aur paymentId add karein
      await Order.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: 'succeeded', paymentId: razorpay_payment_id },
        { new: true }
      );
      res.status(200).json({ message: "Payment verified successfully" });
    } catch (dbError) {
      console.error("Database update error:", dbError);
      res.status(500).json({ message: "Database update failed" });
    }
  } else {
    // Agar signature match nahi hota, to order ko 'failed' mark karein
    try {
      await Order.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: 'failed' }
      );
      res.status(400).json({ message: "Invalid signature, verification failed" });
    } catch (dbError) {
      res.status(500).json({ message: "Database update failed" });
    }
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