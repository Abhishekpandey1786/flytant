const express = require('express');
const router = express.Router();
require('dotenv').config();
const User = require("../models/User");
const Order = require("../models/Order"); // Order model import karein
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
            // Metadata is very important for Webhooks
            metadata: { 
                userId, 
                planName: plan.name,
                userName,
                userPhoneNo: phone,
                amount: plan.price
            }, 
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/plans`,
        });

        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// router.post('/webhook', async (req, res) => {
//     const sig = req.headers['stripe-signature'];
//     let event;

//     try {
//         event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//     } catch (err) {
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     if (event.type === 'checkout.session.completed') {
//         const session = event.data.object;
//         const { userId, planName, userName, userPhoneNo, amount } = session.metadata;

//         try {
//             // 1. Update User Subscription
//             await User.findByIdAndUpdate(userId, { 
//                 isPremium: true, 
//                 currentPlan: planName,
//                 subscriptionDate: new Date()
//             });

//             // 2. Create entry in Order Schema
//             const newOrder = new Order({
//                 userId: userId,
//                 userEmail: session.customer_details.email,
//                 userName: userName,
//                 userPhoneNo: userPhoneNo,
//                 plan: planName,
//                 amount: amount,
//                 orderId: session.id, // Stripe Session ID as Order ID
//                 transactionId: session.payment_intent, // Stripe Payment Intent ID
//                 paymentStatus: "SUCCESS",
//                 responseData: session // Full response storage
//             });

//             await newOrder.save();
//             console.log(`✅ Order & User updated for: ${userId}`);
//         } catch (dbError) {
//             console.error("❌ DB Update Fail:", dbError);
//         }
//     }

//     res.json({ received: true });
// });

// module.exports = router;
router.post('/webhook', async (req, res) => {
    let event;

    // --- TESTING BLOCK START ---
    // Agar aap Postman se test kar rahe hain, toh signature check bypass karein
    if (process.env.NODE_ENV === 'test' || !req.headers['stripe-signature']) {
        event = req.body; 
    } else {
        const sig = req.headers['stripe-signature'];
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error("❌ Webhook Signature Error:", err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
    }
    // --- TESTING BLOCK END ---

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // Metadata se values nikaalna
        const { userId, planName, userName, userPhoneNo, amount } = session.metadata;

        try {
            console.log(`⏳ Processing DB update for User: ${userId}`);

            // 1. User Model Update
            const updatedUser = await User.findByIdAndUpdate(userId, { 
                isPremium: true, 
                currentPlan: planName,
                subscriptionDate: new Date()
            }, { new: true });

            // 2. Order Create
            const newOrder = new Order({
                userId: userId,
                userEmail: session.customer_details?.email || "test@example.com",
                userName: userName || updatedUser?.name,
                userPhoneNo: userPhoneNo,
                plan: planName,
                amount: amount,
                orderId: session.id,
                transactionId: session.payment_intent || "test_transaction_id",
                paymentStatus: "SUCCESS",
                responseData: session 
            });

            await newOrder.save();
            console.log(`✅ Success: User upgraded and Order saved for ${userId}`);
        } catch (dbError) {
            console.error("❌ MongoDB Update Error:", dbError.message);
        }
    }

    res.json({ received: true });
});