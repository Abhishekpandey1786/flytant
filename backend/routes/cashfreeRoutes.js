const express = require("express");
const router = express.Router();
const axios = require("axios");
const Order = require("../models/Order");
const crypto = require("crypto");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

require("dotenv").config();
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
    pass: process.env.MAIL_PASS,
  },
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
// ------------------------------
// CASHFREE WEBHOOK
// ------------------------------
router.post("/webhook", async (req, res) => {
  console.log("---- Incoming Cashfree Webhook ----");

  try {
    // RAW body required
    if (!Buffer.isBuffer(req.body)) {
      console.log("❌ Raw Body Missing! FIX app.js");
      return res.status(200).send("OK");
    }

    const payloadString = req.body.toString("utf8");

    let webhookData;
    try {
      webhookData = JSON.parse(payloadString);
    } catch (err) {
      console.log("❌ Invalid JSON in payload");
      return res.status(200).send("OK");
    }

    const signature =
      req.headers["x-webhook-signature"] || req.headers["X-WEBHOOK-SIGNATURE"];

    const timestamp =
      req.headers["x-webhook-timestamp"] ||
      req.headers["X-WEBHOOK-TIMESTAMP"];

    const eventType = webhookData.event_type || webhookData.type;

    if (!signature || !timestamp || !eventType) {
      console.log("❌ Missing signature/timestamp/eventType");
      return res.status(200).send("OK");
    }

    // 🚩 DEBUG: इसे तब तक चालू रखें जब तक Signature Match न हो जाए
    // console.log("Raw Payload Used for Hash (Check for whitespace):", payloadString);
    
    const dataToHash = eventType + timestamp + payloadString;
    const expectedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(dataToHash)
      .digest("base64");

    if (expectedSignature !== signature) {
      console.log("❌ Signature mismatch! Expected:", expectedSignature); // Expected को लॉग करें
      return res.status(200).send("OK");
    }

    console.log("✅ Signature Validated");

    // Extract safe fields (Nullish Coalescing के साथ सुरक्षित)
    const order = webhookData.data?.order || {};
    const payment = webhookData.data?.payment || {};
    const customer = webhookData.data?.customer_details || {};

    const orderId = order.order_id;
    const orderStatus = payment.payment_status;
    const userId = customer.customer_id;

    if (!orderId) {
      console.log("❌ Missing Order ID");
      return res.status(200).send("OK");
    }

    if (orderStatus === "SUCCESS") {
      console.log(`💰 Payment Success for ${orderId}`);

      let exists = await Order.findOne({ orderId });

      if (exists?.status === "succeeded") {
        console.log("🔁 Already processed");
        return res.status(200).send("OK");
      }

      // 🚨 सुधार 2: cfOrderId को order ऑब्जेक्ट से लें (और Null Coalescing का उपयोग करें)
      const cfOrderId = order.cf_order_id ?? payment.cf_order_id ?? 'N/A';
      const paymentId = payment.cf_payment_id ?? 'N/A';
      const amount = payment.payment_amount ?? 0;
      
      // 🚨 सुधार 1: customer_email और customer_phone को सुरक्षित रूप से एक्सेस करें
      const customerEmail = customer.customer_email ?? 'N/A';
      const customerPhone = customer.customer_phone ?? 'N/A';


      let planName = "Unknown Plan";
      let customerName = "User";

      // DB से स्थानीय ऑर्डर विवरण प्राप्त करें
      const localOrder = await Order.findOne({ orderId });
      if (localOrder) {
        planName = localOrder.planName;
        customerName = localOrder.customerName;
      }

      const newOrderData = {
        userId,
        planName,
        amount,
        orderId,
        cfOrderId,
        paymentId,
        status: "succeeded",
        customerName,
        // 🚨 सुधारा गया: सुरक्षित मानों का उपयोग करें
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        paidAt: new Date(),
      };

      if (!exists) {
        await Order.create(newOrderData);
        console.log("🆕 Order Saved");
      } else {
        // मौजूदा ऑर्डर को अपडेट करते समय, अपडेटेड डेटा का उपयोग करें
        await Order.updateOne({ orderId }, { $set: newOrderData });
        console.log("🔄 Order Updated");
      }

      // Create PDF Folder
      const pdfDir = path.join(__dirname, "..", "pdfs");
      if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir);

      const pdfPath = path.join(pdfDir, `${orderId}.pdf`);
      await generateInvoicePDF(newOrderData, pdfPath); // newOrderData का उपयोग करें

      // Send Invoice Email
      await transporter.sendMail({
        from: process.env.MAIL_ID,
        to: newOrderData.customerEmail,
        subject: `Invoice - ${planName}`,
        html: `<h2>Payment Successful</h2>
               <p>Your payment for <b>${planName}</b> is successful.</p>
               <p><b>Order ID:</b> ${orderId}</p>
               <p><b>Amount:</b> ₹${amount}</p>`,
        attachments: [{ filename: `${orderId}.pdf`, path: pdfPath }],
      });

      console.log("📧 Invoice Sent");
    }
    // FAILED / PENDING स्टेटस को भी संभालें
    else if (orderStatus === "FAILED" || orderStatus === "PENDING") {
        await Order.updateOne(
            { orderId: orderId },
            { $set: { status: orderStatus.toLowerCase() } }
        );
        console.log(`[Webhook EVENT] Order ID: ${orderId} | Status: ${orderStatus}. DB updated.`);
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Webhook Error:", err.message); // केवल मैसेज लॉग करें
    return res.status(200).send("OK");
  }
});
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
    if (statusFromCF === "PAID" && !localOrder) {
    }
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
    const pdfPath = path.join(
      __dirname,
      "..",
      `pdfs/${req.params.orderId}.pdf`
    );
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.download(pdfPath);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
