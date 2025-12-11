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
router.post("/webhook", express.text({ type: "application/json" }), async (req, res) => {
  console.log("---- Incoming Cashfree Webhook Request ----");
  try {
    const headers = req.headers;
    const signature = headers["x-webhook-signature"] || headers["X-WEBHOOK-SIGNATURE"];
    const timestamp = headers["x-webhook-timestamp"] || headers["X-WEBHOOK-TIMESTAMP"];
    
    console.log(`[Debug Headers] Sig: ${signature}, TS: ${timestamp}`);

    const payloadString = req.body; 

    if (!payloadString) {
      console.log("❌ Raw payload string is empty.");
      return res.status(200).send("OK - Empty Payload");
    }

    let data;
    try {
      data = JSON.parse(payloadString);
    } catch (e) {
      console.log("❌ Payload parsing failed (Invalid JSON):", e.message);
      return res.status(200).send("OK - Invalid JSON Payload");
    }
    
    const eventType = data.event_type || data.type;
    
    if (!signature || !timestamp || !eventType) {
      console.log(
        "❌ Missing Cashfree signature, timestamp, or event type. Headers missing!"
      );
      return res.status(200).send("Missing signature/timestamp acknowledged");
    }
    
    const dataToHash = eventType + timestamp + payloadString;

    const expectedSignature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(dataToHash)
      .digest("base64");

    console.log("--- Webhook Signature Check (V2/V3) ---");
    console.log("Received Sig:", signature);
    
    if (signature !== expectedSignature) {
      console.log(
        "❌ Signature mismatch. Webhook rejected.(Key/Payload Mismatch)"
      );
      return res.status(200).send("Invalid signature acknowledged");
    }
    
    console.log("✅ Signature matched. Processing payload.");
    
    const orderId = data.data.order.order_id;
    const orderStatus = data.data.payment.payment_status;
    const MONGO_USER_ID = data.data.order.customer_details.customer_id;
    
    if (orderStatus === "SUCCESS") {
      console.log(
        `[Webhook SUCCESS] Order ID: ${orderId} | User ID: ${MONGO_USER_ID}`
      );
      const exists = await Order.findOne({ orderId });
      
      // Idempotency Check
      if (exists && exists.status === "succeeded") {
        console.log(
          `[Webhook SUCCESS] Order ${orderId} already processed. Skipping.`
        );
        return res.status(200).send("OK - Already processed");
      }
      
      const cfOrderId = data.data.order.cf_order_id;
      const paymentId = data.data.payment.cf_payment_id;
      const amount = data.data.payment.payment_amount;
      const customerEmail = data.data.order.customer_details.customer_email;
      const customerPhone = data.data.order.customer_details.customer_phone;
      
      let planName = "N/A";
      let customerName = "Guest";

      try {
        const localOrder = await Order.findOne({ orderId });
        if (localOrder) {
          planName = localOrder.planName;
          customerName = localOrder.customerName;
        }
      } catch (e) {
        console.error("Local Order lookup failed:", e.message);
      }
      
      if (!exists) {
      
        const newOrder = await Order.create({
          userId: MONGO_USER_ID,
          planName,
          amount,
          orderId,
          cfOrderId: paymentId,
          paymentId,
          status: "succeeded",
          customerName,
          customerEmail,
          customerPhone,
          paidAt: new Date(),
        });
        console.log(
          `[Webhook SUCCESS] New Order saved successfully: ${orderId}`
        );
        
        // --- 🎯 FIX APPLIED HERE: Respond immediately, then handle slow tasks ---
        res.status(200).send("OK");

        // Background Task Setup: Run PDF generation and Email sending WITHOUT 'await'
        // This ensures the main Webhook thread is released immediately.
        try {
            const pdfDir = path.join(__dirname, "..", "pdfs");
            if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

            const pdfPath = path.join(pdfDir, `${orderId}.pdf`);
            
            // Start PDF generation (async, no await)
            generateInvoicePDF(newOrder, pdfPath)
                .then(() => {
                    console.log(`[Background Task] PDF generated for ${orderId}.`);
                    // Start Email Sending (async, no await)
                    return transporter.sendMail({
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
                            },
                        ],
                    });
                })
                .then(() => console.log(`[Background Task] Email sent for ${orderId}.`))
                .catch(e => console.error(`[Background Error] Email/PDF failed for ${orderId}: ${e.message}`));

        } catch(e) {
            console.error(`[Background Setup Error]: ${e.message}`);
        }
        
        return; // Exit the function after sending the response
        
      } else if (exists && exists.status !== "succeeded") {
      
        await Order.updateOne(
          { orderId: orderId },
          {
            $set: {
              status: "succeeded",
              cfOrderId: paymentId,
              paymentId: paymentId,
              paidAt: new Date(),
            },
          }
        );
        console.log(
          `[Webhook SUCCESS] Existing Order updated to succeeded: ${orderId}`
        );
      }
    } else if (orderStatus === "FAILED" || orderStatus === "PENDING") {
      
      await Order.updateOne(
        { orderId: orderId },
        { $set: { status: orderStatus.toLowerCase() } }
      );
      console.log(
        `[Webhook EVENT] Order ID: ${orderId} | Status: ${orderStatus}. DB updated.`
      );
    } else {
      console.log(
        `[Webhook EVENT] Received order status: ${orderStatus}. No DB action taken.`
      );
    }
    
    // Ensure response is sent for all other statuses (FAILED, PENDING, ALREADY_PROCESSED, etc.)
    return res.status(200).send("OK");
    
  } catch (err) {
    console.error("❌ Webhook Internal Error:", err.message);
    return res.status(200).send("Webhook processing error acknowledged");
  }
});

// --- Remaining Routes (No Change) ---
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