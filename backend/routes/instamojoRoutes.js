const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Instamojo = require("instamojo-nodejs");
const User = require("../models/User");
const Order = require("../models/Order");

// API Keys
Instamojo.setKeys(
  process.env.INSTAMOJO_API_KEY,
  process.env.INSTAMOJO_AUTH_TOKEN
);

// Live Mode
Instamojo.isSandboxMode(false);

// Plan Limits
const getMaxApplications = (plan) => {
  const limits = {
    Basic: 6,
    Standard: 15,
    Advance: 40,
    Premium: 9999,
  };
  return limits[plan] || 3;
};

// ✅ Create Payment
router.post("/pay", async (req, res) => {
  try {
    const { plan, userId, email, userName, phone } = req.body;

    if (!plan || !userId || !email) {
      return res.status(400).json({
        error: "Missing plan, userId or email",
      });
    }

    const cleanPhone = (phone || "9999999999")
      .toString()
      .replace(/\D/g, "")
      .slice(-10);

    const amountInINR = parseFloat(plan.price).toFixed(2);

    const data = new Instamojo.PaymentData();
    data.purpose = `Upgrade to ${plan.name}`.substring(0, 30);
    data.amount = amountInINR;
    data.buyer_name = (userName || "Customer").substring(0, 100);
    data.email = email.trim().toLowerCase();
    data.phone = cleanPhone;
    data.send_email = true;
    data.send_sms = false;

    const fUrl = process.env.FRONTEND_URL.replace(/\/$/, "");
    const bUrl = process.env.BACKEND_URL.replace(/\/$/, "");

    data.setRedirectUrl(
      `${fUrl}/payment-status?userId=${userId}&planName=${plan.name}`
    );

    data.webhook = `${bUrl}/api/instamojo/webhook`;

    Instamojo.createPayment(data, (error, response) => {
      if (error) {
        console.error("Instamojo Error:", error);
        return res.status(400).json({
          error: "Instamojo Rejection",
          details: error,
        });
      }

      const responseData =
        typeof response === "string"
          ? JSON.parse(response)
          : response;

      if (responseData.success) {
        return res.json({
          url: responseData.payment_request.longurl,
        });
      } else {
        return res.status(400).json({
          error:
            responseData.message || "Failed to create payment",
        });
      }
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

// ✅ Webhook
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
      .createHmac("sha1", process.env.INSTAMOJO_SALT)
      .update(payload)
      .digest("hex");

    if (generatedMac !== providedMac) {
      return res.status(400).send("Invalid MAC");
    }

    res.status(200).send("OK");
  } catch (error) {
    res.status(500).send("Webhook Failed");
  }
});

// ✅ Verify Payment
router.post("/verify-status", async (req, res) => {
  try {
    const {
      payment_id,
      payment_request_id,
      userId,
      planName,
    } = req.body;

    Instamojo.getPaymentDetails(
      payment_request_id,
      payment_id,
      async (error, response) => {
        if (error) {
          return res
            .status(500)
            .json({ error: "Verification Failed" });
        }

        const result =
          typeof response === "string"
            ? JSON.parse(response)
            : response;

        if (result.success) {
          await User.findByIdAndUpdate(userId, {
            subscription: {
              plan: planName,
              status: "Active",
              maxApplications:
                getMaxApplications(planName),
              expiryDate: new Date(
                Date.now() +
                  30 * 24 * 60 * 60 * 1000
              ),
            },
          });

          await Order.create({
            userId,
            plan: planName,
            amount: result.payment_request.amount,
            transactionId: payment_id,
            paymentStatus: "SUCCESS",
          });

          res.json({
            success: true,
            message: "Subscription Activated!",
          });
        } else {
          res
            .status(400)
            .json({ message: "Payment not completed" });
        }
      }
    );
  } catch (error) {
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

module.exports = router;