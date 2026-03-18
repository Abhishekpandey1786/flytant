const express = require('express');
const router = express.Router();
require('dotenv').config();
const User = require("../models/User");
const Order = require("../models/Order");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// -------------------- CREATE CHECKOUT SESSION --------------------
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { plan, userId, email, userName, phone } = req.body;

    if (!plan || !plan.name || !plan.price) {
      return res.status(400).json({ error: "Plan details missing" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `${plan.name} Plan` },
          unit_amount: Math.round(plan.price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: email,
      metadata: {
        userId: userId.toString(),
        planName: plan.name,
        userName,
        userPhoneNo: phone,
        amount: plan.price.toString()
      },
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/plans`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("❌ Checkout Session Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// -------------------- WEBHOOK HANDLER --------------------
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Webhook Signature Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("🔍 Received Event Type:", event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log("📦 Session Metadata:", session.metadata);

    const { userId, planName, userName, userPhoneNo, amount } = session.metadata || {};

    if (!userId) {
      console.error("❌ CRITICAL: userId missing in metadata!");
      return res.status(400).json({ error: "No userId found" });
    }

    try {
      // 1. Update User
      const updatedUser = await User.findByIdAndUpdate(userId, {
        isPremium: true,
        currentPlan: planName,
        subscriptionDate: new Date()
      }, { new: true });

      if (updatedUser) {
        console.log(`✅ User ${userId} marked as Premium.`);
      } else {
        console.error(`❌ User not found in DB for ID: ${userId}`);
      }

      // 2. Save Order
      const newOrder = new Order({
        userId,
        userEmail: session.customer_details?.email || "test@test.com",
        userName: userName || "N/A",
        userPhoneNo: userPhoneNo || "N/A",
        plan: planName || "Unknown",
        amount: amount || 0,
        orderId: session.id,
        transactionId: session.payment_intent || "test_pi_id",
        paymentStatus: "SUCCESS",
        responseData: session
      });

      await newOrder.save();
      console.log(`✅ Order saved successfully for ${userId}`);
    } catch (dbError) {
      console.error("❌ DATABASE ERROR DETAILS:", dbError);
    }
  } else {
    console.log(`ℹ️ Skipping event type: ${event.type}`);
  }

  res.sendStatus(200); // Always return 200 OK
});

// -------------------- GET USER ORDERS --------------------
router.get("/my-orders/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("❌ Fetch Orders Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
