const express = require('express');
const router = express.Router();
const User = require("../models/User");
const Order = require("../models/Order");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// 🛒 Create Checkout Session
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
                userId: userId.toString(),
                planName: plan.name,
                userName: userName || "N/A",
                userPhoneNo: phone || "N/A",
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

// ⚡ Webhook Handler
router.post('/', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // req.body yahan RAW Buffer hoga kyunki index.js me express.raw use kiya hai
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("❌ Webhook Signature Error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { userId, planName, userName, userPhoneNo, amount } = session.metadata;

        console.log(`🔔 Payment Received for User: ${userId}`);

        try {
            // 1. Update User to Premium
            await User.findByIdAndUpdate(userId, { 
                isPremium: true, 
                currentPlan: planName,
                subscriptionDate: new Date()
            });

            // 2. Create Order in DB
            const newOrder = new Order({
                userId: userId,
                userEmail: session.customer_details?.email,
                userName: userName,
                userPhoneNo: userPhoneNo,
                plan: planName,
                amount: Number(amount),
                orderId: session.id,
                transactionId: session.payment_intent,
                paymentStatus: "SUCCESS",
                responseData: session 
            });

            await newOrder.save();
            console.log("✅ DB Updated: User Premium & Order Saved");
        } catch (dbError) {
            console.error("❌ DB Update Failed:", dbError.message);
        }
    }

    res.json({ received: true });
});

module.exports = router;