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

// ------------------- EMAIL CONFIG -------------------
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASS
    }
});

// ------------------- PDF GENERATOR -------------------
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
    return new Promise(resolve => doc.on("end", resolve));
};

// ------------------- CREATE ORDER -------------------
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

        const payload = {
            order_id: orderId,
            order_amount: amount,
            order_currency: "INR",
            customer_details: {
                customer_id: userId,
                customer_email: customerEmail,
                customer_phone: customerPhone || "9999999999"
            },
            order_meta: {
                return_url: `https://vistafluence.com/payment-status?order_id=${orderId}`,
                custom_meta: {
                    userId,
                    planName,
                    customerName
                }
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
                    "Content-Type": "application/json"
                }
            }
        );

        return res.status(200).json({
            order_id: orderId,
            payment_session_id: cfRes.data.payment_session_id
        });

    } catch (err) {
        console.error("Order creation error:", err.response?.data || err.message);
        return res.status(500).json({
            message: "Order creation failed",
            error: err.response?.data || err.message
        });
    }
});

// ------------------- WEBHOOK TEST -------------------
router.get("/webhook", (req, res) => {
    res.status(200).send("Webhook Active");
});

// ------------------- WEBHOOK RECEIVER -------------------
router.post(
    "/webhook",
    express.raw({ type: "application/json" }),   // MUST HAVE
    async (req, res) => {

        try {
            const signature = req.headers["x-webhook-signature"];
            if (!signature) {
                console.log("❌ Missing signature");
                return res.status(400).send("Missing signature");
            }

            const payload = req.body; // RAW BUFFER

            if (!Buffer.isBuffer(payload)) {
                console.error("❌ Webhook body not buffer");
                return res.status(400).send("Payload must be buffer");
            }

            // Validate signature
            const expectedSignature = crypto
                .createHmac("sha256", WEBHOOK_SECRET)
                .update(payload)
                .digest("base64");

            if (signature !== expectedSignature) {
                console.log("❌ Signature mismatch");
                console.log("Expected:", expectedSignature);
                console.log("Received:", signature);
                return res.status(400).send("Invalid signature");
            }

            // Parse JSON
            const data = JSON.parse(payload.toString());

            const orderId = data.data.order.order_id;
            const cfOrderId = data.data.order.cf_order_id;
            const orderStatus = data.data.order.order_status;
            const paymentId = data.data.payment?.payment_id;
            const amount = data.data.order.order_amount;
            const customerDetails = data.data.customer_details;

            const customMeta = data.data.order.order_meta.custom_meta;
            const { userId, planName, customerName } = customMeta;
            const customerEmail = customerDetails.customer_email;
            const customerPhone = customerDetails.customer_phone;

            // ------------------- IF PAYMENT SUCCESS -------------------
            if (orderStatus === "PAID") {

                const exists = await Order.findOne({ orderId });
                if (exists) {
                    console.log("Already processed:", orderId);
                    return res.status(200).send("OK");
                }

                const newOrder = await Order.create({
                    userId,
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

                // Create invoice folder
                const pdfDir = path.join(__dirname, `../pdfs`);
                if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir);

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
                    attachments: [{ filename: `${orderId}.pdf`, path: pdfPath }]
                });

                console.log("Invoice sent:", orderId);
            }

            return res.status(200).send("OK");

        } catch (err) {
            console.error("Webhook Error:", err);
            return res.status(200).send("Webhook error");
        }
    }
);

// ------------------- CHECK STATUS -------------------
router.get('/check-status/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId })
            .select("orderId status amount planName paidAt");

        if (!order)
            return res.status(404).json({ message: "Order not found" });

        return res.status(200).json(order);
    } catch (err) {
        return res.status(500).send(err.message);
    }
});

// ------------------- USER ORDERS -------------------
router.get('/orders/:userId', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId })
            .sort({ createdAt: -1 });

        return res.status(200).json(orders);
    } catch (err) {
        return res.status(500).send(err.message);
    }
});

// ------------------- DOWNLOAD INVOICE -------------------
router.get('/download-invoice/:orderId', async (req, res) => {
    try {
        const pdfPath = path.join(__dirname, `../pdfs/${req.params.orderId}.pdf`);

        if (!fs.existsSync(pdfPath)) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        res.download(pdfPath);
    } catch (err) {
        return res.status(500).send(err.message);
    }
});

module.exports = router;
