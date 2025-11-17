const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const Order = require('../models/Order'); // Aapka Mongoose Order model

// --- Cashfree Production Configuration (Environment Variables se) ---
// **Yahan apni keys ko process.env se aane dein**
const CASHFREE_API_BASE_URL = process.env.CASHFREE_API_BASE_URL || 'https://api.cashfree.com/pg/orders'; 
const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;
const CASHFREE_WEBHOOK_SECRET = process.env.CASHFREE_WEBHOOK_SECRET; 
// ------------------------------------------------------------------------

// Cashfree API Headers
const cashfreeHeaders = {
    'Content-Type': 'application/json',
    'x-client-id': CASHFREE_CLIENT_ID,
    'x-client-secret': CASHFREE_CLIENT_SECRET,
    'x-api-version': '2022-01-01',
};

// Middleware: Webhook Signature Verification ke liye raw body parse karna zaroori hai
router.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

// --- Endpoint 1: Cashfree Order Create karne ke liye (/api/payments/order) ---
router.post('/order', async (req, res) => {
    try {
        const { amount, currency, planName, userId, customerDetails } = req.body;
        
        if (!amount || !currency || !userId || !customerDetails || !customerDetails.customer_phone || !customerDetails.customer_email) {
            return res.status(400).json({ message: "Missing required fields for Cashfree order." });
        }

        const orderId = 'order_' + Date.now() + '_' + userId;
        
        // **Inhe apne Production URLs se badalna hoga**
        const returnUrl = 'https://YOUR-PRODUCTION-FRONTEND.com/payment/status'; 
        const notifyUrl = 'https://YOUR-PRODUCTION-BACKEND.com/api/payments/webhook'; 

        const orderPayload = {
            order_id: orderId,
            // Cashfree 'rupees' mein amount leta hai, hum client se paise mein expect kar rahe hain
            order_amount: (amount / 100).toFixed(2), 
            order_currency: currency,
            customer_details: customerDetails,
            order_meta: {
                return_url: returnUrl + '?order_id={order_id}&status={order_status}',
                notify_url: notifyUrl, 
            },
        };

        const response = await axios.post(
            CASHFREE_API_BASE_URL,
            orderPayload,
            { headers: cashfreeHeaders }
        );

        const cashfreeOrder = response.data;

        // Database mein pending order record banayein
        const newOrder = new Order({
            userId,
            planName,
            amount: cashfreeOrder.order_amount * 100, // Paise mein store karein
            orderId: cashfreeOrder.order_id,
            status: 'pending',
            paymentSessionId: cashfreeOrder.payment_session_id, 
        });
        await newOrder.save();

        res.status(200).json({
            orderId: cashfreeOrder.order_id,
            paymentSessionId: cashfreeOrder.payment_session_id, 
        });
    } catch (error) {
        console.error("Error creating Cashfree order:", error.response ? error.response.data : error.message);
        res.status(500).send("Error creating order: " + (error.response ? error.response.data.message : error.message));
    }
});

// --- Endpoint 2: Cashfree Webhook Verification (/api/payments/webhook) ---
router.post('/webhook', async (req, res) => {
    try {
        const signature = req.headers['x-cf-signature'];
        const rawBody = req.rawBody.toString(); 

        if (!signature || !rawBody) {
            return res.status(400).send("Missing signature or body");
        }

        // Webhook signature verify karein
        const generatedSignature = crypto.createHmac('sha256', CASHFREE_WEBHOOK_SECRET)
            .update(rawBody)
            .digest('base64');

        if (generatedSignature !== signature) {
            console.error("Webhook: Invalid signature received for order:", req.body.data.order.order_id);
            return res.status(401).send("Invalid signature"); 
        }

        const data = req.body.data;
        const eventType = req.body.event_type;
        const orderStatus = data.order.order_status;
        const orderId = data.order.order_id;
        const paymentId = data.payment ? data.payment.cf_payment_id : null;

        if (eventType === 'ORDER_EVENTS') {
            let updateStatus;
            
            if (orderStatus === 'PAID') {
                updateStatus = 'succeeded';
            } else if (orderStatus === 'FAILED' || orderStatus === 'USER_DROPPED') {
                updateStatus = 'failed';
            } else {
                return res.status(200).send("Status not processed");
            }

            // Database update
            await Order.findOneAndUpdate(
                { orderId: orderId, status: 'pending' }, 
                { status: updateStatus, paymentId: paymentId },
                { new: true }
            );
        }

        res.status(200).send("Webhook acknowledged"); 
    } catch (dbError) {
        console.error("Database update error in webhook:", dbError);
        res.status(200).send("Error processing webhook but acknowledged");
    }
});

// --- Endpoint 3: User ke orders fetch karne ke liye (/api/payments/orders/:userId) ---
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