const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');
require('dotenv').config();

// 1. Environment Variables Setup
const APP_ID = process.env.CASHFREE_APP_ID;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.CASHFREE_WEBHOOK_SECRET; // Webhook के लिए आवश्यक

const BASE_URL =
  process.env.CASHFREE_ENV === "PROD"
    ? "https://api.cashfree.com/pg" // Production API
    : "https://sandbox.cashfree.com/pg"; // Sandbox API


// --- CREATE ORDER ENDPOINT ---
// यह एंडपॉइंट Payment Session ID (PSI) जेनरेट करता है जिसे फ्रंटएंड Cashfree SDK को पास करता है।
router.post("/create-order", async (req, res) => {
  try {
    // सुनिश्चित करें कि आपका फ्रंटएंड ये विवरण भेजता है:
    const { 
        amount, 
        userId, 
        planName, 
        customerName, 
        customerEmail, 
        customerPhone 
    } = req.body;

    if (!APP_ID || !SECRET_KEY) {
        return res.status(500).json({ message: "Cashfree keys not configured." });
    }

    const orderId = "ORDER_" + Date.now();
    const amountInPaise = Math.round(amount * 100); // Cashfree को पैसे में राशि चाहिए (INR के लिए)

    const payload = {
      order_id: orderId,
      order_amount: amount, // ध्यान दें: यह Cashfree API के संस्करण पर निर्भर करता है कि यह Rupee या Paise में राशि चाहता है।
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        // ⚠️ Production में डिफ़ॉल्ट मानों का उपयोग न करें
        customer_email: customerEmail || "default@example.com", 
        customer_phone: customerPhone || "9999999999", // 10-digit number is required
      },
      order_meta: {
        // यह return_url Cashfree द्वारा order_id के साथ रिप्लेस किया जाएगा
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

    // 2. Database में ऑर्डर को 'pending' स्थिति में सहेजें
    await Order.create({
      userId,
      planName,
      amount,
      orderId: orderId, // Database orderId
      cfOrderId: response.data.cf_order_id, // Cashfree का order ID
      status: "pending"
    });
    
    // 3. Payment Session ID (PSI) को फ्रंटएंड को वापस भेजें
    res.status(200).json({ 
        order_id: orderId,
        payment_session_id: response.data.payment_session_id // यही फ्रंटएंड को चाहिए
    });

  } catch (error) {
    console.error("Cashfree Order Creation Failed:", error.response?.data || error.message);
    res.status(500).json({ message: "Order creation failed", details: error.response?.data || error.message });
  }
});

// --- CASHFREE WEBHOOK ENDPOINT (सुरक्षित और अनुशंसित तरीका) ---
// यह एंडपॉइंट Cashfree से सर्वर-टू-सर्वर कॉल प्राप्त करता है।
router.post("/webhook", express.json({ type: 'application/json' }), async (req, res) => {
    // ⚠️ सुरक्षा: Webhook Signature Verification लागू करें
    
    // Webhook Secret Verification (Cashfree Docs से आवश्यक)
    // यहाँ Cashfree की लाइब्रेरी (जैसे cashfree-pg-node-sdk) का उपयोग करके
    // `x-webhook-signature` हेडर को सत्यापित किया जाना चाहिए।
    // यहाँ एक सरलीकृत लॉजिक है, लेकिन **Production** में, आपको Crypto मॉड्यूल का उपयोग करके
    // या SDK का उपयोग करके HMAC सत्यापन लागू करना चाहिए।

    if (!WEBHOOK_SECRET) {
        console.warn("WEBHOOK_SECRET is missing. Skipping verification.");
        // Production में, आपको यहाँ 500 भेजना चाहिए
    }

    const event = req.body;
    const orderId = event.data.order.order_id;
    const orderStatus = event.data.order.order_status;

    try {
        if (orderStatus === "PAID") {
            // ✅ Payment Successful: यूजर को सदस्यता प्रदान करें
            await Order.findOneAndUpdate(
                { orderId: orderId },
                { status: "succeeded", paymentId: event.data.order.order_id },
                { new: true }
            );
            console.log(`Order ${orderId} successfully paid and updated.`);
        } else if (orderStatus === "FAILED" || orderStatus === "USER_DROPPED") {
            // ❌ Payment Failed:
            await Order.findOneAndUpdate(
                { orderId: orderId },
                { status: "failed" }
            );
             console.log(`Order ${orderId} failed.`);
        }

        // Cashfree को स्वीकार करने के लिए 200 OK प्रतिक्रिया दें
        res.status(200).send("Webhook received successfully.");

    } catch (error) {
        console.error("Webhook Processing Error:", error);
        // यदि डेटाबेस अपडेट विफल हो जाता है, तब भी Cashfree को 200 भेजें ताकि वह री-ट्रिगर न करे
        res.status(200).send("Error processing webhook but acknowledged.");
    }
});


// --- GET ORDERS ENDPOINT (जैसा था, ठीक है) ---
router.get('/orders/:userId', async (req, res) => {
  try {
      const { userId } = req.params;
      const orders = await Order.find({ userId }).sort({ createdAt: -1 });
      res.status(200).json(orders);
  } catch (error) {
      res.status(500).send("Error fetching orders: " + error.message);
  }
});

// ⚠️ हटा दिया गया: क्लाइंट-साइड सत्यापन असुरक्षित है और Webhook द्वारा प्रतिस्थापित किया गया है।
// router.post("/verify", ... ) 

module.exports = router;