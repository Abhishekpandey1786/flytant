const express = require("express");
const router = express.Router();
const Instamojo = require("instamojo-nodejs");
const User = require("../models/User");
const Order = require("../models/Order");

// Configuration
Instamojo.setKeys(process.env.INSTAMOJO_API_KEY, process.env.INSTAMOJO_AUTH_TOKEN);
// Live ke liye false karein
Instamojo.isSandboxMode(true); 

const getMaxApplications = (plan) => {
  switch (plan) {
    case "Basic": return 6;
    case "Standard": return 15;
    case "Advance": return 40;
    case "Premium": return 9999;
    default: return 3;
  }
};

// 1. Payment Start Karna
router.post("/pay", async (req, res) => {
  try {
    const { plan, userId, email, userName, phone } = req.body;

    const data = new Instamojo.PaymentData();
    data.purpose = `${plan.name} Plan Upgrade`;
    data.amount = plan.price;
    data.buyer_name = userName;
    data.email = email;
    data.phone = phone;
    data.send_email = true;
    
    // Redirect URL mein metadata pass karna best hai (Stripe ki tarah metadata field nahi hota)
    const redirectUrl = `${process.env.FRONTEND_URL}/payment-status?userId=${userId}&planName=${plan.name}`;
    data.setRedirectUrl(redirectUrl);
    
    // Webhook for server-to-server confirmation
    data.webhook = `${process.env.BACKEND_URL}/api/instamojo/webhook`;

    Instamojo.createPayment(data, (error, response) => {
      if (error) return res.status(500).json({ error });
      const responseData = JSON.parse(response);
      res.json({ url: responseData.payment_request.longurl });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Webhook (Jab payment complete ho jaye)
router.post("/webhook", async (req, res) => {
  // Instamojo webhook data req.body mein bhejta hai (x-www-form-urlencoded)
  const paymentData = req.body;

  if (paymentData.status === "Credit") {
    console.log("✅ Payment Successful via Webhook:", paymentData.payment_id);
    // Note: Yaha se user update karna tabhi possible hai agar aapne 
    // payment request create karte waqt koi mapping rakhi ho.
  }
  res.status(200).send("OK");
});

// 3. Final Verification (Frontend jab redirect ho kar aaye)
router.post("/verify-status", async (req, res) => {
  const { payment_id, payment_request_id, userId, planName } = req.body;

  Instamojo.getPaymentDetails(payment_request_id, payment_id, async (error, response) => {
    if (error) return res.status(500).json({ error });

    if (response.payment_request.status === "Completed") {
      try {
        // Update User Model
        const user = await User.findById(userId);
        if (user) {
          user.subscription = {
            plan: planName,
            status: "Active",
            maxApplications: getMaxApplications(planName),
            applications_made_this_month: 0,
            last_reset_date: new Date(),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          };
          await user.save();
        }

        // Save Order in Database
        const newOrder = new Order({
          userId,
          userEmail: response.payment_request.email,
          userName: response.payment_request.buyer_name,
          plan: planName,
          amount: response.payment_request.amount,
          orderId: payment_request_id,
          transactionId: payment_id,
          paymentStatus: "SUCCESS",
          responseData: response
        });
        await newOrder.save();

        res.json({ success: true, message: "Subscription activated!" });
      } catch (dbErr) {
        res.status(500).json({ error: "Database update failed" });
      }
    } else {
      res.status(400).json({ success: false, message: "Payment not completed" });
    }
  });
});

module.exports = router;