const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Instamojo = require("instamojo-nodejs");
const User = require("../models/User");
const Order = require("../models/Order");

// API Keys Setup
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
router.post("/pay", async (req, res) => {
  try {
    const { plan, userId, email, userName, phone } = req.body;
    if (!plan || !userId || !email) {
      return res.status(400).json({ error: "Missing plan, userId or email" });
    }
    let cleanPhone = phone ? phone.toString().replace(/\D/g, "").slice(-10) : "";
    if (cleanPhone.length < 10) {
        cleanPhone = "8805161391"; 
    }

    let rawPrice = parseFloat(plan.price);
    let amountInINR = rawPrice < 10 ? (rawPrice * 85).toFixed(2) : rawPrice.toFixed(2);

    const data = new Instamojo.PaymentData();
    

    data.purpose = `Upgrade to ${plan.name}`.substring(0, 30); 
    data.amount = amountInINR;
    data.buyer_name = (userName || "Customer").substring(0, 100);
    data.email = email.trim().toLowerCase();
    data.phone = cleanPhone;
    data.send_email = true;
    data.send_sms = false;

    // Safety check for URLs
    const fUrl = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
    const bUrl = (process.env.BACKEND_URL || "").replace(/\/$/, "");

    data.setRedirectUrl(`${fUrl}/payment-status?userId=${userId}&planName=${plan.name}`);
    data.webhook = `${bUrl}/api/instamojo/webhook`;

    Instamojo.createPayment(data, (error, response) => {
      if (error) {
        console.error("❌ Instamojo API Rejection:", error);
        // Error details ko stringify karke bhejein taaki frontend par dikh sake
        return res.status(400).json({ 
            error: "Instamojo Rejection", 
            message: typeof error === 'object' ? JSON.stringify(error) : error 
        });
      }

      try {
        const responseData = typeof response === "string" ? JSON.parse(response) : response;
        
        if (responseData.success && responseData.payment_request) {
          res.json({ url: responseData.payment_request.longurl });
        } else {
          console.log("❌ Response Success False:", responseData);
          res.status(400).json({ error: responseData.message || "Gateway Error" });
        }
      } catch (e) {
        res.status(500).json({ error: "Parsing error from Gateway response" });
      }
    });
  } catch (error) {
    console.error("❌ Critical Server Error:", error);
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
        console.log(`✅ Webhook: Payment successful for ID ${data.payment_id}`);
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

    if (!payment_id || !payment_request_id || !userId) {
        return res.status(400).json({ error: "Missing verification parameters" });
    }

    Instamojo.getPaymentDetails(payment_request_id, payment_id, async (error, response) => {
      if (error) return res.status(500).json({ error: "Verification Failed" });

      const result = typeof response === "string" ? JSON.parse(response) : response;

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
        res.status(400).json({ success: false, message: "Payment not completed" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;