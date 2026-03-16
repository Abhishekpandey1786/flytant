const express = require('express');
const router = express.Router();
require('dotenv').config(); // Load environment variables
const User = require("../models/User");

// Initialize stripe with error handling
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
    console.error("❌ CRITICAL: STRIPE_SECRET_KEY is missing in .env file");
}
const stripe = require('stripe')(stripeKey);

// Checkout Session Create Endpoint
router.post("/create-checkout-session", async (req, res) => {
    try {
        const { plan, userId, email } = req.body;

        if (!plan || !userId) {
            return res.status(400).json({ error: "Missing required data" });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { 
                        name: `${plan.name} Plan`,
                        description: `Vistafluence Subscription`,
                    },
                    unit_amount: Math.round(plan.price * 100), 
                },
                quantity: 1,
            }],
            mode: 'payment',
            customer_email: email,
            metadata: { userId, planName: plan.name }, 
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/plans`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Stripe Session Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Webhook Handler
router.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`⚠️ Webhook Signature Verification Failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { userId, planName } = session.metadata;

        try {
            await User.findByIdAndUpdate(userId, { 
                isPremium: true, 
                currentPlan: planName,
                subscriptionDate: new Date()
            });
            console.log(`✅ Success: User ${userId} upgraded to ${planName}`);
        } catch (dbError) {
            console.error("❌ MongoDB Update Fail:", dbError);
        }
    }

    res.json({ received: true });
});

module.exports = router;