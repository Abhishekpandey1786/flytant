const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const Order = require('../models/Order');

// Cashfree Configuration ⚙️
const CF_API_ENDPOINT = process.env.CF_MODE === 'PROD' 
    ? "https://api.cashfree.com/pg/orders" 
    : "https://sandbox.cashfree.com/pg/orders";

const CF_CLIENT_ID = process.env.CF_CLIENT_ID; 
const CF_CLIENT_SECRET = process.env.CF_CLIENT_SECRET; 

// Cashfree API के लिए Headers तैयार करें
const getCashfreeHeaders = () => ({
    'Content-Type': 'application/json',
    'x-client-id': CF_CLIENT_ID,
    'x-client-secret': CF_CLIENT_SECRET,
    'x-api-version': '2022-09-01',
});

// Endpoint 1: Cashfree Order और Payment Session ID (PSI) बनाने के लिए
router.post('/create-order', async (req, res) => {
    try {
        const { amount, planName, userId, customerName, customerEmail, customerPhone } = req.body;

        const orderId = `ORDER_${userId}_${Date.now()}`;
        const cfAmount = amount; 

        // Webhook URL को डायनामिक रूप से निर्धारित करें
        const dynamicNotifyUrl = `${req.protocol}://${req.get('host')}/api/cashfree/webhook`;
        
        // 1. Cashfree API को Order बनाने के लिए कॉल करें
        const cfOrderPayload = {
            order_id: orderId,
            order_amount: cfAmount,
            order_currency: "INR",
            customer_details: {
                customer_id: userId,
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone,
            },
            order_meta: {
                return_url: `${req.protocol}://${req.get('host')}/payment-success?order_id={order_id}&order_token={order_token}`,
                // 🛠️ सुधार: Webhook URL को Hardcode से डायनामिक में बदला गया
                notify_url: dynamicNotifyUrl, 
            },
            order_note: `Subscription for ${planName}`,
        };

        const response = await axios.post(CF_API_ENDPOINT, cfOrderPayload, {
            headers: getCashfreeHeaders(),
        });
        
        const cfData = response.data; 

        if (cfData.order_status !== 'ACTIVE') {
            throw new Error(`Cashfree Order failed with status: ${cfData.order_status}`);
        }

        // 2. Database में एक नया order record बनाएं (pending status के साथ)
        const newOrder = new Order({
            userId,
            planName,
            amount: cfAmount, 
            orderId: cfData.order_id,
            cfOrderId: cfData.cf_order_id, 
            status: 'pending',
        });
        await newOrder.save();

        // 3. Client को Payment Session ID वापस भेजें
        res.status(200).json({
            order_id: cfData.order_id,
            payment_session_id: cfData.payment_session_id,
        });

    } catch (error) {
        console.error("Error creating Cashfree order:", error.response?.data || error.message);
        res.status(500).send("Error creating order: " + (error.response?.data?.message || error.message));
    }
});

// ------------------------------------------------------------------
// Endpoint 2: Cashfree Webhook (Payment Status Verification के लिए) 🛡️
router.post('/webhook', async (req, res) => {
    // 1. Webhook Signature Verify करें (यह सुनिश्चित करता है कि यह कॉल Cashfree से ही आ रही है)
    const signature = req.headers['x-webhook-signature'];
    const timeStamp = req.headers['x-webhook-timestamp'];
    const webhookSecret = process.env.CF_WEBHOOK_SECRET; 

    // 💡 ध्यान दें: Express.json() Middleware से Webhook body ठीक से parse होनी चाहिए
    // अगर Webhook काम नहीं करता है, तो आपको Webhook लॉजिक से पहले raw body middleware डालना पड़ सकता है
    
    const body = JSON.stringify(req.body); 
    
    const data = timeStamp + body;
    const generatedSignature = crypto.createHmac('sha256', webhookSecret)
        .update(data)
        .digest('base64');

    if (generatedSignature !== signature) {
        console.error("Cashfree Webhook: Invalid Signature");
        return res.status(401).json({ message: "Invalid Signature" });
    }

    // 2. Signature Verify होने के बाद, Payment Status चेक करें
    const event = req.body;
    const orderDetails = event.data.order;
    const paymentStatus = orderDetails.order_status; 
    const orderId = orderDetails.order_id;
    const cfPaymentId = event.data.payment.cf_payment_id;

    let newStatus = 'failed';
    if (paymentStatus === 'PAID') {
        newStatus = 'succeeded';
    } else if (paymentStatus === 'ACTIVE') {
        newStatus = 'pending'; 
    }
    
    // 3. Database में Order Status अपडेट करें
    try {
        await Order.findOneAndUpdate(
            { orderId: orderId },
            { status: newStatus, paymentId: cfPaymentId },
            { new: true }
        );
        res.status(200).send("Webhook received and processed"); 
    } catch (dbError) {
        console.error("Database update error on webhook:", dbError);
        res.status(500).send("Database update failed");
    }
});
// ------------------------------------------------------------------


// Endpoint 3: Existing order fetching 
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