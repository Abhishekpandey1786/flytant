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

const BASE_URL =
  process.env.CASHFREE_ENV === "PROD"
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
// CREATE ORDER (UPDATED WITH PENDING ORDER CHECK)
// ======================
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

    if (!APP_ID || !SECRET_KEY) {
      return res.status(500).json({ message: "Cashfree keys not configured." });
    }

    // customerEmail is essential for payment gateway and invoice
    if (!amount || !userId || !planName || !customerEmail) {
      return res.status(400).json({ message: "Required fields missing." });
    }

    // 🛑 NEW LOGIC START: Check for an existing pending order for this user and plan
    const existingPendingOrder = await Order.findOne({
        userId: userId,
        planName: planName,
        status: "pending" 
    });

    if (existingPendingOrder) {
        console.log(`⚠️ Pending order found for user ${userId}. Attempting to reuse Order ID: ${existingPendingOrder.orderId}`);
        
        try {
            
            const getOrderResponse = await axios.get(
                `${BASE_URL}/orders/${existingPendingOrder.orderId}`,
                {
                    headers: {
                        "x-client-id": APP_ID,
                        "x-client-secret": SECRET_KEY,
                        "x-api-version": "2023-08-01",
                        "Content-Type": "application/json"
                    }
                }
            );

          
            if (getOrderResponse.data.order_status === "ACTIVE") {
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
            console.warn("Could not fetch or reuse old session ID. Proceeding to create a new order.", fetchError.message);
           
        }
    }
  
    const orderId = "ORDER_" + Date.now();

    const payload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_email: customerEmail, // Using actual email as required
        customer_phone: customerPhone || "9999999999"
      },
      order_meta: {
        // User payment ke baad is URL par wapas aayega
        return_url: `https://vistafluence.com/payment-status?order_id=${orderId}`
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
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const signature = req.headers["x-webhook-signature"];
      if (!signature) return res.status(400).send("Missing signature");

      const payload = req.body.toString("utf8");

      // Calculate signature using HMAC-SHA256 (Cashfree often uses hex, but base64 is sometimes used)
      const expectedSignature = crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(payload)
        .digest("base64"); 

      if (signature !== expectedSignature) {
        console.log("❌ Signature mismatch");
        return res.status(400).send("Invalid signature");
      }

      const event = JSON.parse(payload);

      const orderId = event.data.order.order_id;
      const orderStatus = event.data.order.order_status;
      const paymentId = event.data.payment?.payment_id;

      let updatedOrder = null;

      if (orderStatus === "PAID") {
        // 1. Update status and paidAt (Database Update)
        updatedOrder = await Order.findOneAndUpdate(
          { orderId },
          { status: "succeeded", paymentId, paidAt: new Date() },
          { new: true } // Fetch the updated document
        );

        if (!updatedOrder) {
          console.error(`Order not found for ID: ${orderId}`);
          return res.status(404).send("Order not found");
        }
        
        // 🛑 IMPORTANT: PDF GENERATION (FIXED LOCATION)
        // Note: For production, you must use Cloud Storage (like AWS S3) 
        // instead of the local file system (which is ephemeral on platforms like Render).
        
        const pdfDir = path.join(__dirname, `../pdfs`);
        if (!fs.existsSync(pdfDir)){
            fs.mkdirSync(pdfDir);
        }
        
        const pdfPath = path.join(pdfDir, `${orderId}.pdf`);
        const doc = new PDFDocument();

        doc.pipe(fs.createWriteStream(pdfPath));

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

        // 3. Send Email with PDF Attachment
        await new Promise((resolve) => doc.on('end', resolve)); // Wait for PDF to finish writing

        await transporter.sendMail({
          from: process.env.MAIL_ID,
          to: updatedOrder.customerEmail,
          subject: `Payment Successful - Invoice for ${updatedOrder.planName}`,
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
              path: pdfPath
            }
          ]
        });
        
        console.log("✅ Payment Success & Invoice Sent:", orderId);

      } else {
        await Order.findOneAndUpdate(
          { orderId },
          { status: "failed" },
        );
        console.log("❌ Payment Failed:", orderId);
      }

      return res.status(200).send("Webhook Processed");
    } catch (error) {
      console.error("Webhook Error:", error);
      // Return 200 even on error, so Cashfree doesn't keep retrying
      return res.status(200).send("Webhook processing error");
    }
  }
);


// ======================================
// NEW ROUTE: CHECK STATUS FOR FRONTEND REDIRECTION
// ======================================
router.get('/check-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId })
        .select('orderId status amount planName paidAt'); // Only return relevant info

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Return the status (succeeded, pending, failed) for the frontend to navigate
    return res.status(200).json(order);

  } catch (error) {
    return res.status(500).send("Error fetching order status: " + error.message);
  }
});


// ======================
// GET USER ORDERS
// ======================
router.get('/orders/:userId',  async (req, res) => { 
  try {
    const { userId } = req.params;
    
    // SECURITY NOTE: In a real app, ensure req.user.id matches userId here
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });

    return res.status(200).json(orders);

  } catch (error) {
    return res.status(500).send("Error fetching orders: " + error.message);
  }
});
// ======================================
// NEW ROUTE: DOWNLOAD INVOICE PDF
// ======================================
router.get('/download-invoice/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const pdfDir = path.join(__dirname, `../pdfs`);
        const pdfPath = path.join(pdfDir, `${orderId}.pdf`);

        
        if (!fs.existsSync(pdfPath)) {
           
            return res.status(404).json({ message: "Invoice not found. File may not exist on server or was deleted." });
        }
        
        res.download(pdfPath, `${orderId}_invoice.pdf`, (err) => {
            if (err) {
                console.error("Error sending PDF:", err);
                if (!res.headersSent) {
                    return res.status(500).send("Error downloading file.");
                }
            }
        });

    } catch (error) {
        console.error("Error in download-invoice route:", error);
        return res.status(500).send("Server error during file download.");
    }
});


module.exports = router;