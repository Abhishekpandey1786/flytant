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

// यहाँ, WEBHOOK_SECRET को सीधे Hardcode किया गया है
const APP_ID = process.env.CASHFREE_APP_ID;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
// 🔑 HARDCODED FOR DEBUGGING: यह सुनिश्चित करता है कि सही Key का उपयोग हो
const WEBHOOK_SECRET = 'ssbhmoyw2yo7x8li5e7m'; 

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
    return new Promise((resolve) => doc.on("end", resolve));
};

// ----------------------------------------------------
// 1. Create Order Endpoint (अपरिवर्तित)
// ----------------------------------------------------
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
                customer_id: userId,
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

// ----------------------------------------------------
// 2. Cashfree Webhook Handler (V2 Signature Verification)
// ----------------------------------------------------
router.post("/webhook", async (req, res) => {
    try {
        
        // कैशफ्री हेडर प्राप्त करें
        const signature = req.headers["x-cashfree-signature"];
        const timestamp = req.headers["x-cashfree-timestamp"];
        
        
        if (!signature || !timestamp) {
            console.log("❌ Missing Cashfree signature or timestamp header.");
            return res.status(400).send("Missing signature/timestamp");
        }
        
        // Raw Buffer को स्ट्रिंग में बदलें (यह सुनिश्चित करता है कि कोई अतिरिक्त स्पेस नहीं है)
        const payloadBuffer = req.body; 
        const payloadString = payloadBuffer.toString('utf8'); 
        
        // V2 Webhook Verification: timestamp + raw payload
        const dataToHash = timestamp + payloadString;

        const expectedSignature = crypto
            .createHmac("sha256", WEBHOOK_SECRET) // यहाँ Hardcoded Key का उपयोग होगा
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

        // पेलोड को प्रोसेस करना शुरू करें
        const data = JSON.parse(payloadString); 

        const orderId = data.data.order.order_id;
        const orderStatus = data.data.order.order_status;
        
        const MONGO_USER_ID = data.data.customer_details.customer_id; 
        
        if (orderStatus === "PAID") {
            console.log(`[Webhook PAID] Order ID: ${orderId} | User ID: ${MONGO_USER_ID}`);
            
            // डुपलीकेट प्रोसेसिंग से बचें
            const exists = await Order.findOne({ orderId });
            if (exists) {
                console.log(`[Webhook PAID] Order ${orderId} already processed. Skipping.`);
                return res.status(200).send("OK - Already processed");
            }
            
            // डेटा पार्स करें
            const cfOrderId = data.data.order.cf_order_id;
            const amount = data.data.order.order_amount;
            const paymentId = data.data.payment?.payment_id;
            const customerEmail = data.data.customer_details.customer_email;
            const customerPhone = data.data.customer_details.customer_phone;
            const meta = JSON.parse(data.data.order.meta_data.custom_data);
            const { planName, customerName } = meta; 

            // डेटाबेस में सेव करें
            const newOrder = await Order.create({
                userId: MONGO_USER_ID, 
                planName,
                amount,
                orderId,
                cfOrderId,
                paymentId,
                status: "succeeded",
                customerName,
                customerEmail,
                customerPhone,
                paidAt: new Date()
            });
            console.log(`[Webhook PAID] New Order saved successfully: ${orderId}`);
            
            // इन्वॉइस जनरेट और ईमेल करें
            const pdfDir = path.join(__dirname, "..", "pdfs"); 
            if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

            const pdfPath = path.join(pdfDir, `${orderId}.pdf`);
            await generateInvoicePDF(newOrder, pdfPath);

            await transporter.sendMail({
                from: process.env.MAIL_ID,
                to: newOrder.customerEmail,
                subject: `Invoice - ${newOrder.planName}`,
                html: `
                    <h2>Payment Successful</h2>
                    <p>Your payment for <b>${newOrder.planName}</b> is successful.</p>
                    <p><b>Order ID:</b> ${orderId}</p>
                    <p><b>Amount:</b> ₹${newOrder.amount}</p>
                `,
                attachments: [
                    {
                        filename: `${orderId}.pdf`,
                        path: pdfPath,
                    }
                ]
            });

            console.log(`[Webhook PAID] Invoice and Email sent for ${orderId}.`);
        } else {
            console.log(`[Webhook EVENT] Received order status: ${orderStatus}. No action taken.`);
        }

        return res.status(200).send("OK");

    } catch (err) {
        console.error("❌ Webhook Internal Error:", err.message);
        // Cashfree को 200 OK भेजें ताकि वह retry न करे, भले ही आंतरिक त्रुटि हो
        return res.status(200).send("Webhook processing error"); 
    }
});

// ----------------------------------------------------
// 3. Status and Orders Endpoints (अपरिवर्तित)
// ----------------------------------------------------

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