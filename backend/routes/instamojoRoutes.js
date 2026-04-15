const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const axios = require("axios");
const User = require("../models/User");
const Order = require("../models/Order");

// =====================================================
// ⚙️ CONFIGURATION
// =====================================================
const IS_SANDBOX = true; // Test mode ke liye true, Live ke liye false karein
const INSTAMOJO_BASE_URL = IS_SANDBOX 
  ? "https://test.instamojo.com/api/1.1" 
  : "https://www.instamojo.com/api/1.1";

const planCodes = {
  Basic: "BASIC",
  Standard: "STANDARD",
  Advance: "ADVANCE",
  Premium: "PREMIUM",
};

const planNames = {
  BASIC: "Basic",
  STANDARD: "Standard",
  ADVANCE: "Advance",
  PREMIUM: "Premium",
};

const getMaxApplications = (plan) => {
  const limits = {
    Basic: 6,
    Standard: 15,
    Advance: 40,
    Premium: 9999,
  };
  return limits[plan] || 3;
};

// =====================================================
// 1️⃣ PAY API (Create Payment Link)
// =====================================================
router.post("/pay", async (req, res) => {
  try {
    const { plan, userId, email, userName, phone } = req.body;

    if (!plan || !userId || !email) {
      return res.status(400).json({ error: "Missing plan, userId or email" });
    }

    const planCode = planCodes[plan.name];
    if (!planCode) return res.status(400).json({ error: "Invalid Plan" });

    const amountInINR = parseFloat(plan.price).toFixed(2);

    // Payload taiyar karein
    const params = new URLSearchParams();
    params.append("purpose", `${planCode}|${userId}`);
    params.append("amount", amountInINR);
    params.append("buyer_name", (userName || "Customer").substring(0, 100));
    params.append("email", email.trim().toLowerCase());
    params.append("redirect_url", `${process.env.FRONTEND_URL}/payment-status?userId=${userId}&plan=${planCode}`);
    params.append("webhook", `${process.env.BACKEND_URL}/api/instamojo/webhook`);
    params.append("allow_repeated_payments", "false");
    params.append("send_email", "true");

    if (phone) {
      const cleanPhone = phone.toString().replace(/\D/g, "").slice(-10);
      if (cleanPhone.length === 10) params.append("phone", cleanPhone);
    }

    const response = await axios.post(`${INSTAMOJO_BASE_URL}/payment-requests/`, params, {
      headers: {
        "X-Api-Key": process.env.INSTAMOJO_API_KEY,
        "X-Auth-Token": process.env.INSTAMOJO_AUTH_TOKEN,
      },
    });

    res.json({
      success: true,
      url: response.data.payment_request.longurl,
    });
  } catch (error) {
    console.error("❌ Pay API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Payment creation failed" });
  }
});

// =====================================================
// 2️⃣ WEBHOOK API (Automatic Background Sync)
// =====================================================
router.post("/webhook", async (req, res) => {
  try {
    const data = req.body;
    const providedMac = data.mac;
    delete data.mac;

    // MAC Verification (Security check)
    const payload = Object.keys(data).sort().map(key => data[key]).join("|");
    const generatedMac = crypto
      .createHmac("sha1", process.env.INSTAMOJO_SALT || "your_salt")
      .update(payload)
      .digest("hex");

    // Note: Live mein MAC verify zaroor karein
    if (data.status === "Credit") {
      const [planCode, userId] = data.purpose.split("|");
      const planName = planNames[planCode];

      const existingOrder = await Order.findOne({ transactionId: data.payment_id });
      if (!existingOrder) {
        await Order.create({
          userId,
          plan: planName,
          amount: data.amount,
          transactionId: data.payment_id,
          paymentStatus: "SUCCESS",
          userEmail: data.buyer,
        });

        await User.findByIdAndUpdate(userId, {
          subscription: {
            plan: planName,
            status: "Active",
            maxApplications: getMaxApplications(planName),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
        console.log("✅ Webhook: Subscription Activated");
      }
    }
    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    res.status(500).send("Error");
  }
});

// =====================================================
// 3️⃣ VERIFY STATUS (Frontend Redirect Verification)
// =====================================================
router.post("/verify-status", async (req, res) => {
  try {
    const { payment_id, payment_request_id, userId, planCode } = req.body;

    if (!payment_id || !payment_request_id) {
      return res.status(400).json({ success: false, message: "Missing IDs" });
    }

    const response = await axios.get(
      `${INSTAMOJO_BASE_URL}/payment-requests/${payment_request_id}/${payment_id}/`,
      {
        headers: {
          "X-Api-Key": process.env.INSTAMOJO_API_KEY,
          "X-Auth-Token": process.env.INSTAMOJO_AUTH_TOKEN,
        },
      }
    );

    const result = response.data;

    if (result.success && result.payment_request.payment.status === "Credit") {
      const planName = planNames[planCode];

      let existingOrder = await Order.findOne({ transactionId: payment_id });
      if (!existingOrder) {
        await Order.create({
          userId,
          plan: planName,
          amount: result.payment_request.payment.amount,
          transactionId: payment_id,
          paymentStatus: "SUCCESS",
        });

        await User.findByIdAndUpdate(userId, {
          subscription: {
            plan: planName,
            status: "Active",
            maxApplications: getMaxApplications(planName),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
      }
      return res.json({ success: true, message: "Subscription Activated!" });
    } else {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }
  } catch (error) {
    console.error("❌ Verification Error:", error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: "Gateway verification failed",
      debug: error.response?.data 
    });
  }
});

// =====================================================
// 4️⃣ GET ORDERS
// =====================================================
router.get("/my-orders/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

module.exports = router;