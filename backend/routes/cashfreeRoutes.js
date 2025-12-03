const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');
const crypto = require("crypto");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

require('dotenv').config();
const APP_ID = process.env.CASHFREE_APP_ID;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.CASHFREE_WEBHOOK_SECRET; 

const BASE_URL =
    process.env.CASHFREE_ENV === "PROD"
        ? "https://api.cashfree.com/pg"
        : "https://sandbox.cashfree.com/pg";


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASS
    }
});

const generateInvoicePDF = async (orderData, pdfPath) => {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(22).text("Payment Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Order ID: ${orderData.orderId}`);
    doc.text(`Cashfree ID: ${orderData.cfOrderId}`);
    doc.text(`Payment ID: ${orderData.paymentId}`);
    doc.text(`Plan: ${orderData.planName}`);
    doc.text(`Amount: ₹${orderData.amount}`);
    doc.text(`Customer: ${orderData.customerName}`);
    doc.text(`Status: SUCCESS`);
    doc.text(`Paid At: ${orderData.paidAt.toLocaleString()}`);

    doc.end();
    return new Promise((r) => doc.on("end", r));
};

router.post("/create-order", async (req, res) => {
    try {
        const {
            amount,
            userId,
            planName,
            customerName,
            customerEmail,
            customerPhone
        } = req.body;

        if (!amount || !userId || !planName || !customerEmail) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        const orderId = "ORDER_" + Date.now();
        console.log(`[Order Creation] Initiating payment for User ID: ${userId}`);

        const payload = {
            order_id: orderId,
            order_amount: amount,
            order_currency: "INR",
            customer_details: {
                customer_id: userId, // Ensure this is the actual MongoDB ID
                customer_email: customerEmail,
                customer_phone: customerPhone || "9999999999",
            },
            order_meta: {
                return_url: `https://vistafluence.com/payment-status?order_id=${orderId}`,
            },
            meta_data: {
                custom_data: JSON.stringify({
                    planName,
                    customerName
                })
            }
        };

        const cfRes = await axios.post(
            `${BASE_URL}/orders`,
            payload,
            {
                headers: {
                    "x-client-id": APP_ID,
                    "x-client-secret": SECRET_KEY,
                    "x-api-version": "2023-08-01",
                    "Content-Type": "application/json",
                }
            }
        );

        return res.status(200).json({
            order_id: orderId,
            payment_session_id: cfRes.data.payment_session_id
        });

    } catch (err) {
        console.error("[Order Creation Error]:", err.response?.data || err.message);
        return res.status(500).json({
            message: "Order creation failed",
            error: err.response?.data || err.message
        });
    }
});
// -------------------
// 2. Webhook Handler (Corrected with Debug Log)
// -------------------
router.post("/webhook", async (req, res) => {
    try {
        
        // 🚨 डीबग लॉग: सभी प्राप्त हेडर प्रिंट करें
        console.log("--- START: Incoming Webhook Headers ---");
        console.log(req.headers); 
        console.log("--------------------------------------");
        
        // कैशफ्री हेडर प्राप्त करें
        const signature = req.headers["x-cashfree-signature"];
        const timestamp = req.headers["x-cashfree-timestamp"];
        
        
        if (!signature || !timestamp) {
            console.log("❌ Missing Cashfree signature or timestamp header.");
            // Webhook URL कॉन्फिगरेशन या Cashfree की तरफ से हेडर नहीं भेजे जा रहे हैं।
            return res.status(400).send("Missing signature/timestamp");
        }
        
        // Raw Buffer को स्ट्रिंग में बदलें
        const payloadBuffer = req.body; 
        const payloadString = payloadBuffer.toString('utf8'); 
        
        // टाइमस्टैम्प को रॉ बॉडी के साथ concatenate करें 
        const dataToHash = timestamp + payloadString;

        const expectedSignature = crypto
            .createHmac("sha256", WEBHOOK_SECRET) 
            .update(dataToHash) 
            .digest("base64");

        
        console.log("--- Webhook Signature Check ---");
        console.log("Received Sig:", signature);
        console.log("Calculated Sig:", expectedSignature);
        
        if (signature !== expectedSignature) {
            console.log("❌ Signature mismatch. Webhook rejected.");
            return res.status(400).send("Invalid signature");
        }
        console.log("✅ Signature matched. Processing payload.");

        const data = JSON.parse(payloadString); 

        const orderId = data.data.order.order_id;
        const orderStatus = data.data.order.order_status;
        
        const MONGO_USER_ID = data.data.customer_details.customer_id; 
        
        if (orderStatus === "PAID") {
            // ... (बाकी सक्सेस लॉजिक)
        } else {
            console.log(`[Webhook EVENT] Received order status: ${orderStatus}. No action taken.`);
        }

        return res.status(200).send("OK");

    } catch (err) {
        console.error("❌ Webhook Internal Error:", err.message);
        return res.status(200).send("Webhook processing error"); 
    }
});

router.get('/check-status/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) return res.status(404).json({ message: "Order not found" });

        res.status(200).json(order);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.get("/orders/:userId", async (req, res) => {
    const { userId } = req.params; 
    
    try {
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });

        if (!orders || orders.length === 0) {
            return res.status(200).json([]); 
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ message: "Server error fetching orders." });
    }
});

router.get('/download-invoice/:orderId', async (req, res) => {
    try {
        const pdfPath = path.join(__dirname, "..", `pdfs/${req.params.orderId}.pdf`);
        
        if (!fs.existsSync(pdfPath)) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        res.download(pdfPath);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;