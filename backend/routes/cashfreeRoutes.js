const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order');
const crypto = require("crypto");

// PDF and Email dependencies
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

require('dotenv').config();

const APP_ID = process.env.CASHFREE_APP_ID;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.CASHFREE_WEBHOOK_SECRET;

const IS_PROD = process.env.CASHFREE_ENV === "PROD";
const BASE_URL = IS_PROD
  ? "https://api.cashfree.com/pg"
  : "https://sandbox.cashfree.com/pg";

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_ID,
    pass: process.env.MAIL_PASS
  }
});


// ======================
// CREATE ORDER (UPDATED AND IMPROVED)
// ======================
router.post("/create-order", async (req, res) => {
    try {
        const { 
            amount: rawAmount, 
            userId, 
            planName, 
            customerName, 
            customerEmail, 
            customerPhone 
        } = req.body;

        if (!APP_ID || !SECRET_KEY) {
            return res.status(500).json({ message: "Cashfree keys not configured." });
        }

        if (!rawAmount || !userId || !planName || !customerEmail) {
            return res.status(400).json({ message: "Required fields missing." });
        }

        // 🛑 FIX 1: Ensure amount is a number for Cashfree API
        const amount = Number(rawAmount); 

        // Cashfree Sandbox requires a minimum amount, check if amount is too low for sandbox
        if (!IS_PROD && amount < 1) {
            // You can set a default minimum for testing in sandbox
            console.warn("Amount is too low for Sandbox. Using minimum 1 INR.");
        }

        // --- Existing Logic to reuse PENDING order session ---
        const existingPendingOrder = await Order.findOne({ userId, planName, status: "pending" });

        if (existingPendingOrder) {
            try {
                const getOrderResponse = await axios.get(`${BASE_URL}/orders/${existingPendingOrder.orderId}`, {
                    headers: { "x-client-id": APP_ID, "x-client-secret": SECRET_KEY, "x-api-version": "2023-08-01", "Content-Type": "application/json" }
                });

                if (getOrderResponse.data.order_status === "ACTIVE") {
                    console.log(`Reusing session ID for Order ID: ${existingPendingOrder.orderId}`);
                    return res.status(200).json({
                        message: "Pending order found. Reusing session ID.",
                        order_id: existingPendingOrder.orderId,
                        payment_session_id: getOrderResponse.data.payment_session_id
                    });
                } else {
                    await Order.updateOne({ _id: existingPendingOrder._id }, { status: "expired" });
                    console.log(`Old Cashfree order status was ${getOrderResponse.data.order_status}. Creating new order.`);
                }
            } catch (fetchError) {
                console.warn("Could not fetch or reuse old session ID. Creating new order.", fetchError.message);
            }
        }
        // --- End existing PENDING order logic ---
  
        const orderId = "ORDER_" + Date.now();
        
        console.log(`💰 Creating Cashfree order for: ₹${amount}`);

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
                // Ensure this URL is correct for your hosted frontend
                return_url: `https://vistafluence.com/payment-status?order_id=${orderId}`
            }
        };

        const response = await axios.post(`${BASE_URL}/orders`, payload, {
            headers: { "x-client-id": APP_ID, "x-client-secret": SECRET_KEY, "x-api-version": "2023-08-01", "Content-Type": "application/json" }
        });

        // Save new order as pending
        await Order.create({
            userId,
            planName,
            amount,
            orderId,
            cfOrderId: response.data.cf_order_id,
            status: "pending",
            customerName,
            customerEmail,
            customerPhone
        });

        return res.status(200).json({
            order_id: orderId,
            payment_session_id: response.data.payment_session_id
        });

    } catch (error) {
        console.error("❌ Cashfree Order Creation Failed:", error.response?.data || error.message);
        return res.status(500).json({
            message: "Order creation failed",
            details: error.response?.data || error.message
        });
    }
});


// ======================
// WEBHOOK HANDLER (Main Logic for Status Update, PDF, and Email)
// ======================

router.get("/webhook", (req, res) => {
  res.status(200).send("Webhook endpoint is live");
});
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("🔥 Webhook POST HIT");

    try {
        const signature = req.headers["x-webhook-signature"];
        if (!signature) return res.status(400).send("Missing signature");

        const payload = req.body.toString("utf8");

        // 🛑 FIX 2: Change crypto digest to 'hex' (Cashfree often requires this over base64)
        const expectedSignature = crypto
            .createHmac("sha256", WEBHOOK_SECRET)
            .update(payload)
            .digest("hex"); 
        
        // If the signature fails, try base64 as a fallback, then fail
        if (signature !== expectedSignature) {
            const expectedSignatureBase64 = crypto
                .createHmac("sha256", WEBHOOK_SECRET)
                .update(payload)
                .digest("base64");
            
            if (signature !== expectedSignatureBase64) {
                console.log(`❌ Signature mismatch. Received: ${signature}. Expected (hex): ${expectedSignature}`);
                return res.status(400).send("Invalid signature");
            }
        }

        const event = JSON.parse(payload);

        const orderId = event.data.order.order_id;
        const orderStatus = event.data.order.order_status;
        const paymentId = event.data.payment?.payment_id;

        if (orderStatus === "PAID") {
            // 1. Update status
            const updatedOrder = await Order.findOneAndUpdate(
                { orderId, status: "pending" }, // Only update if currently pending
                { status: "succeeded", paymentId, paidAt: new Date() },
                { new: true } 
            );

            if (!updatedOrder) {
                // This order was already updated or not found (e.g., duplicate webhook call)
                console.warn(`Order not found or already processed for ID: ${orderId}`);
                return res.status(200).send("Order already processed or not found.");
            }
            
            // 🛑 FIX 3: Create PDF in Memory Buffer (for ephemeral servers like Render)
            const doc = new PDFDocument();
            let pdfBuffer = [];
            doc.on('data', pdfBuffer.push.bind(pdfBuffer));
            doc.on('end', async () => {
                const finalBuffer = Buffer.concat(pdfBuffer);
                
                // Send Email with PDF Buffer Attachment
                try {
                    await transporter.sendMail({
                        from: process.env.MAIL_ID,
                        to: updatedOrder.customerEmail,
                        subject: `✅ Payment Successful - Invoice for ${updatedOrder.planName}`,
                        html: `
                            <h2>Payment Successful</h2>
                            <p>Hello ${updatedOrder.customerName || 'Customer'},</p>
                            <p>Thank you for your purchase. Your payment for the <b>${updatedOrder.planName}</b> plan was successful.</p>
                            <p><b>Order ID:</b> ${orderId}</p>
                            <p><b>Amount Paid:</b> ₹${updatedOrder.amount}</p>
                            <p><b>Date:</b> ${updatedOrder.paidAt.toLocaleString()}</p>
                            <p>Please find the detailed invoice attached below.</p>
                            <p>Regards,<br>Vistafluence Team</p>
                        `,
                        attachments: [
                            {
                                filename: `${orderId}_invoice.pdf`,
                                content: finalBuffer // Send the buffer directly
                            }
                        ]
                    });
                    console.log("✅ Payment Success & Invoice Sent:", orderId);
                } catch (mailError) {
                    console.error("❌ Email sending failed:", mailError);
                }
            });
            
            // Generate PDF content
            doc.fontSize(22).text("Payment Invoice", { align: "center" });
            doc.moveDown();
            doc.fontSize(14).text(`Order ID: ${orderId}`);
            doc.text(`Cashfree ID: ${updatedOrder.cfOrderId || 'N/A'}`);
            doc.text(`Payment ID: ${paymentId}`);
            doc.text(`Plan: ${updatedOrder.planName}`);
            doc.text(`Amount Paid: ₹${updatedOrder.amount}`);
            doc.text(`Customer: ${updatedOrder.customerName || 'N/A'}`);
            doc.text(`Status: SUCCESS`);
            doc.text(`Date Paid: ${updatedOrder.paidAt.toLocaleString()}`);
            doc.end();

        } else {
            // Handle failed/other status updates
            await Order.findOneAndUpdate(
                { orderId, status: "pending" },
                { status: orderStatus.toLowerCase() }, // e.g., 'failed', 'expired'
            );
            console.log(`❌ Payment Status Update: ${orderStatus} for ${orderId}`);
        }

        // Send 200 OK back to Cashfree immediately
        return res.status(200).send("Webhook Processed");

    } catch (error) {
        console.error("Webhook Error:", error);
        // Return 200 even on error, so Cashfree doesn't keep retrying
        return res.status(200).send("Webhook processing error");
    }
  }
);


// ======================================
// CHECK STATUS FOR FRONTEND REDIRECTION (OK)
// ======================================
router.get('/check-status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findOne({ orderId }).select('orderId status amount planName paidAt'); 

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).send("Error fetching order status: " + error.message);
    }
});


// ======================
// GET USER ORDERS (OK)
// ======================
router.get('/orders/:userId',  async (req, res) => { 
    try {
        const { userId } = req.params;
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).send("Error fetching orders: " + error.message);
    }
});

// ======================================
// REMOVED: DOWNLOAD INVOICE PDF (Not possible on Render ephemeral storage)
// The invoice is now sent via email using in-memory PDF buffer.
// ======================================

module.exports = router;