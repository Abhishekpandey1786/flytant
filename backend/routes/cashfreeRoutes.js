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


// ---------------- EMAIL TRANSPORTER ----------------
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASS
    }
});


// ---------------- PDF GENERATION ----------------
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



// ---------------------------------------------------
// ✅ CREATE ORDER
// ---------------------------------------------------
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
                custom_data: JSON.stringify({ planName, customerName })
            }
        };

        const cfRes = await axios.post(
            `${BASE_URL}/orders`,
            payload,
            {
                headers: {
                    "x-client-id": APP_ID,
                    "x-client-secret": SECRET_KEY,
                    "x-api-version": "2025-01-01",
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



// ---------------------------------------------------
// ✅ WEBHOOK — RAW BODY REQUIRED
// ---------------------------------------------------
router.post("/webhook", async (req, res) => {

    console.log("---- Incoming Webhook Request ----");

    try {
        const signature = req.headers["x-webhook-signature"];
        const timestamp = req.headers["x-webhook-timestamp"];

        if (!signature || !timestamp) {
            console.log("❌ Missing signature or timestamp");
            return res.status(200).send("Missing signature");
        }

        let payloadString;

        // RAW BODY BUFFER REQUIRED
        if (Buffer.isBuffer(req.body)) {
            payloadString = req.body.toString("utf8").trim();
        } else {
            console.log("❌ Raw payload not buffer");
            return res.status(200).send("Bad payload type");
        }

        if (!payloadString) {
            console.log("❌ Empty Payload");
            return res.status(200).send("Empty payload");
        }

        const dataToHash = timestamp + "." + payloadString;

        const expectedSignature = crypto
            .createHmac("sha256", WEBHOOK_SECRET)
            .update(dataToHash)
            .digest("base64");

        console.log("--- Webhook Signature Check (V5) ---");
        console.log("Received:", signature);
        console.log("Calculated:", expectedSignature);

        if (signature !== expectedSignature) {
            console.log("❌ Signature mismatch");
            return res.status(200).send("Invalid signature");
        }

        console.log("✅ Signature matched");

        const data = JSON.parse(payloadString);

        const orderId = data.data.order.order_id;
        const orderStatus = data.data.order.order_status;
        const MONGO_USER_ID = data.data.order.customer_details.customer_id;

        if (orderStatus === "PAID") {

            console.log(`[Webhook PAID] Order ID: ${orderId}`);

            const exists = await Order.findOne({ orderId });
            if (exists) {
                console.log(`Already processed`);
                return res.status(200).send("OK");
            }

            const cfOrderId = data.data.order.cf_order_id;
            const amount = data.data.order.order_amount;
            const paymentId = data.data.payment?.payment_id;
            const customerEmail = data.data.customer_details.customer_email;
            const customerPhone = data.data.customer_details.customer_phone;

            const meta = JSON.parse(data.data.order.meta_data.custom_data);
            const { planName, customerName } = meta;

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

            const pdfDir = path.join(__dirname, "..", "pdfs");
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

            console.log(`Invoice sent`);
        }

        return res.status(200).send("OK");

    } catch (err) {
        console.error("Webhook Error:", err.message);
        return res.status(200).send("Error");
    }
});



// ---------------------------------------------------
// ✅ CHECK ORDER STATUS
// ---------------------------------------------------
router.get('/check-status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const cfRes = await axios.get(
            `${BASE_URL}/orders/${orderId}`,
            {
                headers: {
                    "x-client-id": APP_ID,
                    "x-client-secret": SECRET_KEY,
                    "x-api-version": "2025-01-01",
                }
            }
        );

        const cfOrderData = cfRes.data;
        const statusFromCF = cfOrderData.order_status;

        let localOrder = await Order.findOne({ orderId });

        return res.status(200).json({
            message: "Status fetched",
            cashfree_data: cfOrderData,
            db_status: localOrder ? localOrder.status : "NOT_IN_DB"
        });

    } catch (err) {
        return res.status(500).json({
            message: "Failed to fetch order",
            error: err.response?.data || err.message
        });
    }
});



// ---------------------------------------------------
// ✅ GET ALL USER ORDERS
// ---------------------------------------------------
router.get("/orders/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });

        return res.status(200).json(orders || []);
    } catch (error) {
        res.status(500).json({ message: "Server error fetching orders" });
    }
});



// ---------------------------------------------------
// ✅ TERMINATE ORDER
// ---------------------------------------------------
router.patch('/terminate-order/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const payload = { order_status: "TERMINATED" };

        const cfRes = await axios.patch(
            `${BASE_URL}/orders/${orderId}`,
            payload,
            {
                headers: {
                    "x-client-id": APP_ID,
                    "x-client-secret": SECRET_KEY,
                    "x-api-version": "2025-01-01",
                }
            }
        );

        const cfOrderData = cfRes.data;

        if (cfOrderData.order_status === "TERMINATED") {
            await Order.updateOne(
                { orderId: orderId },
                { $set: { status: "terminated" } }
            );
        }

        return res.status(200).json({
            message: `Order termination status: ${cfOrderData.order_status}`,
            cashfree_data: cfOrderData
        });

    } catch (err) {
        return res.status(500).json({
            message: "Failed to terminate order",
            error: err.response?.data || err.message
        });
    }
});



// ---------------------------------------------------
// ✅ GET EXTENDED DETAILS
// ---------------------------------------------------
router.get('/get-extended-details/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const cfRes = await axios.get(
            `${BASE_URL}/orders/${orderId}/extended`,
            {
                headers: {
                    "x-client-id": APP_ID,
                    "x-client-secret": SECRET_KEY,
                    "x-api-version": "2025-01-01",
                }
            }
        );

        return res.status(200).json({
            message: "Extended data fetched",
            extended_data: cfRes.data
        });

    } catch (err) {
        return res.status(500).json({
            message: "Failed to fetch extended details",
            error: err.response?.data || err.message
        });
    }
});



// ---------------------------------------------------
// ✅ DOWNLOAD INVOICE
// ---------------------------------------------------
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
