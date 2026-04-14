const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Instamojo = require("instamojo-nodejs");
const User = require("../models/User");
const Order = require("../models/Order");

// Live Keys Configuration
Instamojo.setKeys(
  process.env.INSTAMOJO_API_KEY,
  process.env.INSTAMOJO_AUTH_TOKEN
);

// Live Mode (Production)
Instamojo.isSandboxMode(false);

const getMaxApplications = (plan) => {
  const limits = { Basic: 6, Standard: 15, Advance: 40, Premium: 9999 };
  return limits[plan] || 3;
};

// ✅ 1. Create Payment Request
router.post("/pay", async (req, res) => {
  try {
    const { plan, userId, email, userName, phone } = req.body;

    // Basic Validations
    if (!plan || !userId || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // --- Instamojo Strict Phone Validation ---
    // Number se non-digits (+, spaces) hatao aur last 10 digits lo
    let cleanPhone = phone ? phone.toString().replace(/\D/g, "").slice(-10) : "";
    
    // Live mode dummy "9999999999" reject karta hai. 
    // Isliye frontend se real number aana mandatory hai.
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: "A valid 10-digit Indian phone number is required" });
    }

    // --- Amount Conversion (Strictly INR) ---
    // Instamojo needs a string or number >= 10.00
    const rawPrice = parseFloat(plan.price);
    const amountInINR = rawPrice < 10 ? (rawPrice * 85).toFixed(2) : rawPrice.toFixed(2);

    const data = new Instamojo.PaymentData();
    data.purpose = `${plan.name} Plan Upgrade`.substring(0, 30); // 30 chars limit
    data.amount = amountInINR;
    data.buyer_name = (userName || "Customer").substring(0, 100);
    data.email = email.trim();
    data.phone = cleanPhone;
    data.send_email = true;
    data.send_sms = false;

    // Safety check for URLs (Trailing slash removal)
    const fUrl = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
    const bUrl = (process.env.BACKEND_URL || "").replace(/\/$/, "");

    data.setRedirectUrl(`${fUrl}/payment-status?userId=${userId}&planName=${plan.name}`);
    data.webhook = `${bUrl}/api/instamojo/webhook`;

    Instamojo.createPayment(data, (error, response) => {
      if (error) {
        console.error("❌ Instamojo API Error:", error);
        return res.status(400).json({ error: "Instamojo Rejection", details: error });
      }

      try {
        const responseData = typeof response === "string" ? JSON.parse(response) : response;
        if (responseData.success && responseData.payment_request) {
          res.json({ url: responseData.payment_request.longurl });
        } else {
          res.status(400).json({ error: responseData.message || "Invalid response" });
        }
      } catch (e) {
        res.status(500).json({ error: "Parsing error from Gateway" });
      }
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ 2. Webhook (Secure Background Update)
router.post("/webhook", async (req, res) => {
  try {
    const data = req.body;
    const providedMac = data.mac;
    delete data.mac;

    const keys = Object.keys(data).sort().map(key => data[key]);
    const payload = keys.join("|");
    const generatedMac = crypto
      .createHmac("sha1", process.env.INSTAMOJO_SALT || "")
      .update(payload)
      .digest("hex");

    if (generatedMac !== providedMac) return res.status(400).send("Invalid MAC");

    if (data.status === "Credit") {
        console.log("✅ Payment Verified via Webhook");
        // Aap yahan bhi DB update ka logic daal sakte hain safety ke liye
    }
    res.status(200).send("OK");
  } catch (error) {
    res.status(500).send("Webhook Failed");
  }
});

// ✅ 3. Verify Status
router.post("/verify-status", async (req, res) => {
  try {
    const { payment_id, payment_request_id, userId, planName } = req.body;

    Instamojo.getPaymentDetails(payment_request_id, payment_id, async (error, response) => {
      if (error) return res.status(500).json({ error: "Verification Failed" });

      const result = typeof response === "string" ? JSON.parse(response) : response;

      // Robust check for success status
      const isSuccess = result.payment_request && 
                        (result.payment_request.status === "Completed" || 
                         result.payment_request.payment?.status === "Credit");

      if (isSuccess) {
        await User.findByIdAndUpdate(userId, {
          subscription: {
            plan: planName,
            status: "Active",
            maxApplications: getMaxApplications(planName),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        const order = new Order({
          userId,
          plan: planName,
          amount: result.payment_request.amount,
          transactionId: payment_id,
          paymentStatus: "SUCCESS",
        });
        await order.save();

        res.json({ success: true, message: "Subscription Activated!" });
      } else {
        res.status(400).json({ success: false, message: "Payment was not successful" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;