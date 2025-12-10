const express = require("express");
const router = express.Router();
const axios = require("axios");
const Order = require("../models/Order"); // Assuming your Order model path is correct
const crypto = require("crypto");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

require("dotenv").config();

// --- Configuration ---
const APP_ID = process.env.CASHFREE_APP_ID;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.CASHFREE_WEBHOOK_SECRET;
const BASE_URL =
  process.env.CASHFREE_ENV === "PROD"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

// --- Nodemailer Transporter (for sending emails) ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_ID,
    // IMPORTANT: For Gmail, use an App Password here.
    pass: process.env.MAIL_PASS, 
  },
});

// --- Helper Functions ---

/**
 * Generates an invoice PDF.
 */
const generateInvoicePDF = async (orderData, pdfPath) => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(pdfPath));

  doc.fontSize(22).text("Payment Invoice", { align: "center" });
  doc.moveDown();

  doc.fontSize(14).text(`Order ID: ${orderData.orderId}`);
  doc.text(`Cashfree ID: ${orderData.cfOrderId || 'N/A'}`);
  doc.text(`Payment ID: ${orderData.paymentId || 'N/A'}`);
  doc.text(`Plan: ${orderData.planName}`);
  doc.text(`Amount: ₹${orderData.amount}`);
  doc.text(`Customer: ${orderData.customerName}`);
  doc.text(`Status: SUCCESS`);
  // Ensure paidAt is a valid Date object for toLocaleString()
  doc.text(`Paid At: ${new Date(orderData.paidAt).toLocaleString()}`); 

  doc.end();
  return new Promise((resolve) => doc.on("end", resolve));
};

/**
 * Non-blocking email sending function. 
 * This runs in the background and does not hold up the webhook response.
 */
const sendInvoiceEmailAsync = async (order, pdfPath) => {
    try {
        console.log(`[Email] Starting send for ${order.orderId} to ${order.customerEmail}...`);
        
        await transporter.sendMail({
            from: process.env.MAIL_ID,
            to: order.customerEmail,
            subject: `Invoice - ${order.planName} Payment Successful`,
            html: `
                <h2>Payment Successful</h2>
                <p>Hello ${order.customerName},</p>
                <p>Your payment of <b>₹${order.amount}</b> for <b>${order.planName}</b> is successful.</p>
                <p><b>Order ID:</b> ${order.orderId}</p>
                <p>Please find the invoice attached.</p>
            `,
            attachments: [{ filename: `${order.orderId}.pdf`, path: pdfPath }],
        });
        
        console.log(`📨 [Email] Invoice Sent successfully for ${order.orderId}`);
        
        // Optional: Clean up the PDF file after sending
        fs.unlink(pdfPath, (err) => {
             if (err) console.error(`[PDF Cleanup Error] Could not delete ${pdfPath}:`, err);
             else console.log(`[PDF Cleanup] Deleted ${pdfPath}`);
        });

    } catch (err) {
        // Log the email failure, but the main webhook process has already succeeded.
        console.error(`❌ [Email FAILED] for ${order.orderId}. Error:`, err.message, err.code);
    }
};

// --- Routes ---

router.post("/create-order", async (req, res) => {
  try {
    const {
      amount,
      userId,
      planName,
      customerName,
      customerEmail,
      customerPhone,
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
          customerName,
        }),
      },
    };

    const cfRes = await axios.post(`${BASE_URL}/orders`, payload, {
      headers: {
        "x-client-id": APP_ID,
        "x-client-secret": SECRET_KEY,
        "x-api-version": "2025-01-01",
        "Content-Type": "application/json",
      },
    });
    
    // Save initial order details to DB (optional, but recommended)
    await Order.create({
        userId,
        planName,
        customerName,
        amount,
        orderId,
        customerEmail,
        customerPhone: customerPhone || "9999999999",
        status: "pending",
        cfOrderId: cfRes.data.cf_order_id,
    });
    console.log("✔ Pending order saved:", orderId);

    return res.status(200).json({
      order_id: orderId,
      payment_session_id: cfRes.data.payment_session_id,
    });
  } catch (err) {
    console.error("[Order Creation Error]:", err.response?.data || err.message);
    return res.status(500).json({
      message: "Order creation failed",
      error: err.response?.data || err.message,
    });
  }
});

router.post("/webhook", async (req, res) => {
  console.log("---- Incoming Cashfree Webhook ----");

  try {
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];

    console.log("[Sig Debug] Signature:", signature);
    console.log("[Sig Debug] Timestamp:", timestamp);

    if (!signature || !timestamp) return res.status(200).send("Missing signature");

    // IMPORTANT: Check for raw body configuration (must be a Buffer for proper hashing)
    if (!Buffer.isBuffer(req.body)) {
      console.log("❌ Raw body not buffer. Fix middleware order!");
      return res.status(200).send("Raw payload error");
    }

    const rawBodyString = req.body.toString("utf8");
    if (!rawBodyString) return res.status(200).send("Empty payload");

    let parsed;
    try {
      parsed = JSON.parse(rawBodyString);
    } catch (err) {
      console.log("❌ JSON parse error:", err.message);
      return res.status(200).send("Invalid JSON");
    }

    const eventType = parsed.event_type;
    if (!eventType) return res.status(200).send("No event_type");

    // Signature verification (V3)
    const dataToHash = eventType + timestamp + rawBodyString;
    const expectedSignature = crypto.createHmac("sha256", WEBHOOK_SECRET).update(dataToHash).digest("base64");

    if (signature !== expectedSignature) {
        console.log("❌ Signature MISMATCH (Payload/Key wrong)");
        return res.status(200).send("Invalid Signature");
    }

    console.log("✅ Signature MATCHED — Processing Payment");

    const orderId = parsed.data.order.order_id;
    const orderStatus = parsed.data.payment.payment_status;

    if (orderStatus === "SUCCESS") {
      console.log(`[✔ SUCCESS] Payment Confirmed for ${orderId}`);
      
      const cfOrderId = parsed.data.order.cf_order_id;
      const paymentId = parsed.data.payment.cf_payment_id;
      const amount = parsed.data.payment.payment_amount;
      const email = parsed.data.order.customer_details.customer_email;
      const phone = parsed.data.order.customer_details.customer_phone;
      const userId = parsed.data.order.customer_details.customer_id;
      const paidAt = new Date(); // Capture success time

      let existing = await Order.findOne({ orderId });

      // Determine metadata from existing record or use defaults/payload data
      let planName = existing?.planName || 'N/A';
      let customerName = existing?.customerName || 'Customer';

      if (!existing) {
        // Create new record (if payment was successful but order wasn't saved before)
        existing = await Order.create({
          userId,
          planName,
          customerName,
          amount,
          orderId,
          cfOrderId,
          paymentId,
          customerEmail: email,
          customerPhone: phone,
          status: "succeeded",
          paidAt: paidAt,
        });
        console.log("✔ New order saved on success:", orderId);
      } else {
        // Update existing record
        await Order.updateOne(
          { orderId },
          { $set: { status: "succeeded", cfOrderId, paymentId, paidAt: paidAt, amount: amount } }
        );
        console.log("✔ Existing order updated:", orderId);
        // Fetch the updated document for PDF generation
        existing = await Order.findOne({ orderId }); 
      }
      
      // Ensure we have a populated object for the email helper
      const orderForEmail = {
          orderId, amount, customerEmail: email, customerName, planName: existing.planName, paidAt: existing.paidAt, cfOrderId, paymentId
      };

      // Generate PDF Invoice
      const pdfDir = path.join(__dirname, "..", "pdfs");
      if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
      const pdfPath = path.join(pdfDir, `${orderId}.pdf`);
      await generateInvoicePDF(orderForEmail, pdfPath); // Use orderForEmail (or existing)

      // 🛑 THE FIX: Call the email function WITHOUT 'await'.
      // This sends the email asynchronously and allows the 200 OK to be sent instantly.
      sendInvoiceEmailAsync(orderForEmail, pdfPath);
      
    } else if (orderStatus === "FAILED") {
        console.log(`[❌ FAILED] Payment Failed for ${orderId}. Updating DB.`);
        await Order.updateOne({ orderId }, { $set: { status: "failed", paidAt: new Date() } });
    }


    // 🏆 FINAL FIX: Send the 200 OK response IMMEDIATELY
    return res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Webhook Error (Internal Logic Failure):", err);
    // Always return 200 OK after successful signature validation to stop retries.
    return res.status(200).send("Webhook Error");
  }
});

// ========================== OTHER ROUTES ==========================

router.get("/check-status/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const cfRes = await axios.get(`${BASE_URL}/orders/${orderId}`, {
      headers: {
        "x-client-id": APP_ID,
        "x-client-secret": SECRET_KEY,
        "x-api-version": "2025-01-01",
        "Content-Type": "application/json",
      },
    });

    const cfOrderData = cfRes.data;
    const statusFromCF = cfOrderData.order_status;
    console.log(`[Check Status] Order ID: ${orderId}, Status: ${statusFromCF}`);
    let localOrder = await Order.findOne({ orderId });
    // Note: The redundant block in your original code is removed here.

    return res.status(200).json({
      message: "Order status fetched from Cashfree successfully.",
      cashfree_data: cfOrderData,
      db_status: localOrder ? localOrder.status : "NOT_IN_DB",
    });
  } catch (err) {
    console.error("[Get Order Error]:", err.response?.data || err.message);
    if (err.response?.status === 404) {
      return res.status(404).json({ message: "Order not found on Cashfree." });
    }
    return res.status(500).json({
      message: "Failed to fetch order status from Cashfree.",
      error: err.response?.data || err.message,
    });
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

router.patch("/terminate-order/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(`[Terminate Order] Request received for Order ID: ${orderId}`);
    const payload = {
      order_status: "TERMINATED",
    };

    const cfRes = await axios.patch(`${BASE_URL}/orders/${orderId}`, payload, {
      headers: {
        "x-client-id": APP_ID,
        "x-client-secret": SECRET_KEY,
        "x-api-version": "2025-01-01",
        "Content-Type": "application/json",
      },
    });

    const cfOrderData = cfRes.data;

    if (cfOrderData.order_status === "TERMINATED") {
      await Order.updateOne(
        { orderId: orderId },
        { $set: { status: "terminated" } }
      );
      console.log(
        `[Terminate Order] Successfully terminated and updated local DB for ${orderId}.`
      );
    } else if (cfOrderData.order_status === "TERMINATION_REQUESTED") {
      console.log(
        `[Terminate Order] Termination requested for ${orderId}. Current status: ${cfOrderData.order_status}`
      );
    }
    return res.status(200).json({
      message: `Order termination request status: ${cfOrderData.order_status}`,
      cashfree_data: cfOrderData,
    });
  } catch (err) {
    console.error(
      "[Terminate Order Error]:",
      err.response?.data || err.message
    );
    if (err.response?.status) {
      return res.status(err.response.status).json({
        message: "Failed to terminate order.",
        error: err.response?.data || err.message,
      });
    }
    return res.status(500).json({
      message: "Internal server error during order termination.",
      error: err.message,
    });
  }
});

router.get("/get-extended-details/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(
      `[Get Extended] Fetching extended details for Order ID: ${orderId}`
    );
    const cfRes = await axios.get(`${BASE_URL}/orders/${orderId}/extended`, {
      headers: {
        "x-client-id": APP_ID,
        "x-client-secret": SECRET_KEY,
        "x-api-version": "2025-01-01",
        "Content-Type": "application/json",
      },
    });

    const extendedOrderData = cfRes.data;

    return res.status(200).json({
      message: "Extended order details fetched from Cashfree successfully.",
      extended_data: extendedOrderData,
    });
  } catch (err) {
    console.error("[Get Extended Error]:", err.response?.data || err.message);
    if (err.response?.status === 404) {
      return res
        .status(404)
        .json({ message: "Order or extended data not found on Cashfree." });
    }
    return res.status(500).json({
      message: "Failed to fetch extended order details from Cashfree.",
      error: err.response?.data || err.message,
    });
  }
});

router.get("/download-invoice/:orderId", async (req, res) => {
  try {
    const pdfPath = path.join(__dirname, "..", `pdfs/${req.params.orderId}.pdf`);
    if (!fs.existsSync(pdfPath)) return res.status(404).json({ message: "Invoice not found" });
    res.download(pdfPath);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;