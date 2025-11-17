const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const Order = require('../models/Order'); // Aapka Order model

// --- Cashfree Production Configuration (Environment Variables se) ---
// Production API Base URL: Cashfree Production ke liye 'https://api.cashfree.com/pg/orders' use karein.
// Development/Staging ke liye: 'https://sandbox.cashfree.com/pg/orders' use karein.
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
    'x-api-version': '2022-01-01', // Recommended API version
};

// Middleware: Webhook Signature Verification ke liye raw body parse karna zaroori hai
router.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

// --- 1. Endpoint: Order Create karne ke liye ---
router.post('/order', async (req, res) => {
    try {
        const { amount, currency, planName, userId, customerDetails } = req.body;
        
        // Validation: Required fields check karein
        if (!amount || !currency || !userId || !customerDetails || !customerDetails.customer_phone || !customerDetails.customer_email) {
            return res.status(400).json({ message: "Missing required fields for Cashfree order." });
        }

        // Order ID generate karein
        const orderId = 'order_' + Date.now() + '_' + userId;
        
        // Inhe aapko apne Production URLs se badalna hoga
        const returnUrl = 'https://YOUR-PRODUCTION-FRONTEND.com/payment/success'; 
        const notifyUrl = 'https://YOUR-PRODUCTION-BACKEND.com/api/payments/webhook'; 

        const orderPayload = {
            order_id: orderId,
            // Cashfree 'rupees' mein amount leta hai
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
            amount,
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
        console.error("Error creating Cashfree production order:", error.response ? error.response.data : error.message);
        res.status(500).send("Error creating order: " + (error.response ? error.response.data.message : error.message));
    }
});

// --- 2. Endpoint: Cashfree Webhook Verification (Production Ready) ---
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
            // Unauthorized access block karein
            return res.status(401).send("Invalid signature"); 
        }

        const data = req.body.data;
        const eventType = req.body.event_type;
        const orderStatus = data.order.order_status;
        const orderId = data.order.order_id;
        const paymentId = data.payment ? data.payment.cf_payment_id : null;

        // Order events ko process karein
        if (eventType === 'ORDER_EVENTS') {
            let updateStatus;
            
            if (orderStatus === 'PAID') {
                updateStatus = 'succeeded';
            } else if (orderStatus === 'FAILED' || orderStatus === 'USER_DROPPED') {
                updateStatus = 'failed';
            } else if (orderStatus === 'ACTIVE') {
                // Subscription payment ke liye, jise aap "pending" ya "active" hi rakh sakte hain
                updateStatus = 'active'; 
            } else {
                return res.status(200).send("Status not processed");
            }

            // Database update
            await Order.findOneAndUpdate(
                { orderId: orderId, status: 'pending' }, // Status 'pending' hona zaroori hai
                { status: updateStatus, paymentId: paymentId },
                { new: true }
            );
        }

        // Cashfree ko 200 OK response dena zaroori hai
        res.status(200).send("Webhook acknowledged"); 
    } catch (dbError) {
        console.error("Database update error in webhook:", dbError);
        // Agar database update fail ho, tab bhi Cashfree ko 200 OK bhej den
        res.status(200).send("Error processing webhook but acknowledged");
    }
});

// --- 3. Endpoint: User ke orders fetch karne ke liye ---
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