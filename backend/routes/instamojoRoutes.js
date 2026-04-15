const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Instamojo = require("instamojo-nodejs");
const User = require("../models/User");
const Order = require("../models/Order");

Instamojo.setKeys(
  process.env.INSTAMOJO_API_KEY,
  process.env.INSTAMOJO_AUTH_TOKEN,
);
Instamojo.isSandboxMode(false);

const getMaxApplications = (plan) => {
  const limits = { Basic: 6, Standard: 15, Advance: 40, Premium: 9999 };
  return limits[plan] || 3;
};
router.post("/pay", async (req, res) => {
  try {
    const { plan, userId, email, userName, phone } = req.body;

    if (!plan || !userId || !email) {
      return res.status(400).json({
        error: "Missing plan, userId or email",
      });
    }

    // Clean phone number (last 10 digits)
    let cleanPhone = phone
      ? phone.toString().replace(/\D/g, "").slice(-10)
      : "";

    // Amount in INR
    const amountInINR = parseFloat(plan.price).toFixed(2);

    const data = new Instamojo.PaymentData();
    data.purpose = `Upgrade to ${plan.name}`.substring(0, 30);
    data.amount = amountInINR;
    data.currency = "INR";
    data.buyer_name = (userName || "Customer").substring(0, 100);
    data.email = email.trim().toLowerCase();

    if (cleanPhone) {
      data.phone = cleanPhone;
    }

    data.send_email = true;
    data.send_sms = false;

    const fUrl = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
    const bUrl = (process.env.BACKEND_URL || "").replace(/\/$/, "");

    data.setRedirectUrl(
      `${fUrl}/payment-status?userId=${userId}&planName=${plan.name}`
    );

    data.webhook = `${bUrl}/api/instamojo/webhook`;

    Instamojo.createPayment(data, (error, response) => {
      if (error) {
        console.error("❌ Instamojo API Rejection:", error);
        return res.status(400).json({
          error: "Instamojo Rejection",
          message: error.message || error,
        });
      }

      const responseData =
        typeof response === "string" ? JSON.parse(response) : response;

      if (responseData.success && responseData.payment_request) {
        return res.json({
          success: true,
          url: responseData.payment_request.longurl,
        });
      } else {
        return res.status(400).json({
          error: responseData.message || "Gateway Error",
        });
      }
    });
  } catch (error) {
    console.error("❌ Critical Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/webhook", async (req, res) => {
  try {
    const data = req.body;
    const providedMac = data.mac;
    delete data.mac;

    const keys = Object.keys(data)
      .sort()
      .map((key) => data[key]);
    const payload = keys.join("|");
    const generatedMac = crypto
      .createHmac("sha1", process.env.INSTAMOJO_SALT || "")
      .update(payload)
      .digest("hex");

    if (generatedMac !== providedMac)
      return res.status(400).send("Invalid MAC");

    if (data.status === "Credit") {
      console.log(`✅ Webhook: Payment successful for ID ${data.payment_id}`);
    }
    res.status(200).send("OK");
  } catch (error) {
    res.status(500).send("Webhook Failed");
  }
});
router.post("/verify-status", async (req, res) => {
  try {
    const { payment_id, payment_request_id, userId, planName } = req.body;

    if (!payment_id || !payment_request_id || !userId) {
      return res.status(400).json({ error: "Missing verification parameters" });
    }

    Instamojo.getPaymentDetails(
      payment_request_id,
      payment_id,
      async (error, response) => {
        if (error)
          return res.status(500).json({ error: "Verification Failed" });

        const result =
          typeof response === "string" ? JSON.parse(response) : response;

        const isSuccess =
          result.payment_request &&
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
          res
            .status(400)
            .json({ success: false, message: "Payment not completed" });
        }
      },
    );
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
