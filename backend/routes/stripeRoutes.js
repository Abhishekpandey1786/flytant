const express = require('express');
const router = express.Router();
require('dotenv').config();
const User = require("../models/User");
const Order = require("../models/Order");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post("/create-checkout-session", async (req, res) => {
    try {
        const { plan, userId, email, userName, phone } = req.body;
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
                userId: userId.toString(), // Ensure it's a string
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
        res.status(500).json({ error: error.message });
    }
});

router.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    if (!sig) {
        console.log("⚠️ Manual Testing detected.");
        event = req.body; 
    } else {
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error("❌ Webhook Signature Error:", err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
    }

    // DEBUG LOG 1: Check event type
    console.log("🔍 Received Event Type:", event.type);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // DEBUG LOG 2: Check metadata
        console.log("📦 Session Metadata:", session.metadata);

        const { userId, planName, userName, userPhoneNo, amount } = session.metadata || {};

        if (!userId) {
            console.error("❌ CRITICAL: userId missing in metadata!");
            return res.status(400).json({ error: "No userId found" });
        }

        try {
            console.log(`⏳ Attempting DB Update for User ID: ${userId}`);

            // 1. User Update
            const updatedUser = await User.findByIdAndUpdate(userId, { 
                isPremium: true, 
                currentPlan: planName,
                subscriptionDate: new Date()
            }, { new: true });

            if (!updatedUser) {
                console.error(`❌ User not found in DB for ID: ${userId}`);
            } else {
                console.log(`✅ User ${userId} marked as Premium.`);
            }

            // 2. Order Create
            const newOrder = new Order({
                userId: userId,
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

    res.json({ received: true });
});
router.get("/my-orders/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;