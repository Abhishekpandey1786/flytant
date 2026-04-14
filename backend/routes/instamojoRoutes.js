const express = require("express");
const router = express.Router();
const Instamojo = require("instamojo-nodejs");
const User = require("../models/User");
const Order = require("../models/Order");

// Live Keys (Make sure these are in your .env)
Instamojo.setKeys(process.env.INSTAMOJO_API_KEY, process.env.INSTAMOJO_AUTH_TOKEN);
Instamojo.isSandboxMode(false); 

const getMaxApplications = (plan) => {
  const limits = { "Basic": 6, "Standard": 15, "Advance": 40, "Premium": 9999 };
  return limits[plan] || 3;
};

// 1. Create Payment Request
router.post("/pay", async (req, res) => {
  try {
    const { plan, userId, email, userName, phone } = req.body;

    const data = new Instamojo.PaymentData();
    data.purpose = `${plan.name} Plan Upgrade`;
    data.amount = plan.price;
    data.buyer_name = userName || "Client";
    data.email = email;
    data.phone = phone || "9999999999";
    data.send_email = true;
    
    // Redirect back to your frontend
    const redirectUrl = `https://vistafluence.com/payment-status?userId=${userId}&planName=${plan.name}`;
    data.setRedirectUrl(redirectUrl);
    data.webhook = `https://vistafluence.onrender.com/api/instamojo/webhook`;

    Instamojo.createPayment(data, (error, response) => {
      if (error) return res.status(500).json({ error: "Instamojo link failed" });
      const responseData = JSON.parse(response);
      res.json({ url: responseData.payment_request.longurl });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Webhook for background confirmation
router.post("/webhook", async (req, res) => {
  if (req.body.status === "Credit") {
    console.log("Payment Confirmed for:", req.body.payment_id);
  }
  res.status(200).send("OK");
});

// 3. Status Verification (When user returns to frontend)
router.post("/verify-status", async (req, res) => {
  const { payment_id, payment_request_id, userId, planName } = req.body;

  Instamojo.getPaymentDetails(payment_request_id, payment_id, async (error, response) => {
    if (error) return res.status(500).json({ error });

    if (response.payment_request.status === "Completed") {
      try {
        await User.findByIdAndUpdate(userId, {
          subscription: {
            plan: planName,
            status: "Active",
            maxApplications: getMaxApplications(planName),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        });

        const order = new Order({
          userId,
          plan: planName,
          amount: response.payment_request.amount,
          transactionId: payment_id,
          paymentStatus: "SUCCESS"
        });
        await order.save();

        res.json({ success: true, message: "Subscription active!" });
      } catch (err) { res.status(500).json({ error: "DB update failed" }); }
    } else {
      res.status(400).json({ success: false, message: "Payment failed" });
    }
  });
});

module.exports = router;