const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Instamojo = require("instamojo-nodejs");
const User = require("../models/User");
const Order = require("../models/Order");

// API Keys Configuration
Instamojo.setKeys(
  process.env.INSTAMOJO_API_KEY,
  process.env.INSTAMOJO_AUTH_TOKEN
);

// Testing ke liye true rakhein, Production ke liye false
const isSandbox = false; 
Instamojo.isSandboxMode(isSandbox);

const getMaxApplications = (plan) => {
  const limits = { Basic: 6, Standard: 15, Advance: 40, Premium: 9999 };
  return limits[plan] || 3;
};

// ✅ 1. Create Payment Request
router.post("/pay", async (req, res) => {
  try {
    const { plan, userId, email, userName, phone } = req.body;

    if (!plan || !userId || !email) {
      return res.status(400).json({ error: "Missing required fields (plan, userId, or email)" });
    }

    // Instamojo requires INR and minimum ₹10. 
    // Agar frontend se $1 aa raha hai, to ise INR mein convert karein (approx 85)
    // Agar aap direct INR bhej rahe hain to conversion hatado.
    let amountInINR = plan.price; 
    if (plan.price < 10) {
        amountInINR = plan.price * 85; // $1 becomes ₹85
    }

    const data = new Instamojo.PaymentData();
    data.purpose = `${plan.name} Plan Upgrade`;
    data.amount = amountInINR;
    data.buyer_name = userName || "Client";
    data.email = email;
    data.phone = (phone && phone.length === 10) ? phone : "9999999999";
    data.send_email = true;
    data.send_sms = false; // SMS charges avoid karne ke liye false

    // Redirect and Webhook URLs
    const redirectUrl = `${process.env.FRONTEND_URL}/payment-status?userId=${userId}&planName=${plan.name}`;
    data.setRedirectUrl(redirectUrl);
    data.webhook = `${process.env.BACKEND_URL}/api/instamojo/webhook`;

    Instamojo.createPayment(data, (error, response) => {
      if (error) {
        console.error("❌ Instamojo API Error:", error);
        return res.status(500).json({ error: "Instamojo link failed", details: error });
      }

      const responseData = typeof response === "string" ? JSON.parse(response) : response;

      if (responseData.success && responseData.payment_request) {
        res.json({ url: responseData.payment_request.longurl });
      } else {
        console.log("❌ Instamojo Response:", responseData);
        res.status(400).json({ error: responseData.message || "Invalid response from Instamojo" });
      }
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ 2. Webhook Verification (Backend to Backend)
router.post("/webhook", async (req, res) => {
  try {
    const data = req.body;
    const providedMac = data.mac;
    delete data.mac;

    // Sort and verify MAC for security
    const keys = Object.keys(data).sort().map(key => data[key]);
    const payload = keys.join("|");
    const generatedMac = crypto
      .createHmac("sha1", process.env.INSTAMOJO_SALT)
      .update(payload)
      .digest("hex");

    if (generatedMac !== providedMac) {
      return res.status(400).send("Invalid MAC signature");
    }

    if (data.status === "Credit") {
      console.log(`✅ Webhook: Payment successful for ID ${data.payment_id}`);
      // Note: Webhook se database update karna zyada secure hota hai
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    res.status(500).send("Webhook processing failed");
  }
});

// ✅ 3. Verify Status (Frontend success page se call hoga)
router.post("/verify-status", async (req, res) => {
  try {
    const { payment_id, payment_request_id, userId, planName } = req.body;

    if (!payment_id || !payment_request_id || !userId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    Instamojo.getPaymentDetails(payment_request_id, payment_id, async (error, response) => {
      if (error) {
        console.error("❌ Verification Error:", error);
        return res.status(500).json({ error: "Could not fetch payment details" });
      }

      const result = typeof response === "string" ? JSON.parse(response) : response;

      // Status 'Completed' ya 'Credit' check karein depend on API version
      const isSuccess = result.payment_request && 
                        (result.payment_request.status === "Completed" || result.payment_request.payment.status === "Credit");

      if (isSuccess) {
        try {
          // Update User Subscription
          await User.findByIdAndUpdate(userId, {
            subscription: {
              plan: planName,
              status: "Active",
              maxApplications: getMaxApplications(planName),
              expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Days
            },
          });

          // Save Order Record
          const order = new Order({
            userId,
            plan: planName,
            amount: result.payment_request.amount,
            transactionId: payment_id,
            paymentStatus: "SUCCESS",
          });
          await order.save();

          res.json({ success: true, message: "Subscription Activated!" });
        } catch (dbErr) {
          console.error("❌ DB Update Error:", dbErr);
          res.status(500).json({ error: "Payment successful but DB update failed" });
        }
      } else {
        res.status(400).json({ success: false, message: "Payment status is not successful" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;