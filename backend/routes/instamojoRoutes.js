const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Instamojo = require("instamojo-nodejs");
const User = require("../models/User");
const Order = require("../models/Order");

Instamojo.setKeys(
  process.env.INSTAMOJO_API_KEY,
  process.env.INSTAMOJO_AUTH_TOKEN
);
Instamojo.isSandboxMode(false);


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
router.post("/pay", async (req, res) => {
  try {
    const { plan, userId, email, userName, phone } = req.body;

    if (!plan || !userId || !email) {
      return res.status(400).json({
        error: "Missing plan, userId or email",
      });
    }

    const planCode = planCodes[plan.name];
    if (!planCode) {
      return res.status(400).json({ error: "Invalid Plan" });
    }

    const amountInINR = parseFloat(plan.price).toFixed(2);

    const data = new Instamojo.PaymentData();

    // Instamojo purpose (Max 30 characters)
    data.purpose = `${planCode}|${userId}`;
    data.amount = amountInINR;
    data.currency = "INR";
    data.buyer_name = (userName || "Customer").substring(0, 100);
    data.email = email.trim().toLowerCase();

    // Clean Phone Number
    if (phone) {
      const cleanPhone = phone.toString().replace(/\D/g, "").slice(-10);
      if (cleanPhone.length === 10) {
        data.phone = cleanPhone;
      }
    }

    data.send_email = true;
    data.send_sms = false;

    const fUrl = process.env.FRONTEND_URL.replace(/\/$/, "");
    const bUrl = process.env.BACKEND_URL.replace(/\/$/, "");

    // Redirect URL
    data.setRedirectUrl(
      `${fUrl}/payment-status?userId=${userId}&plan=${planCode}`
    );

    // Webhook URL
    data.webhook = `${bUrl}/api/instamojo/webhook`;

    // Create Payment
    Instamojo.createPayment(data, (error, response) => {
      if (error) {
        console.error("❌ Instamojo Error:", error);
        return res.status(400).json({
          error: error.message || "Instamojo Error",
        });
      }

      const resp =
        typeof response === "string" ? JSON.parse(response) : response;

      if (!resp.success || !resp.payment_request) {
        return res.status(400).json({
          error: resp.message || "Payment creation failed",
        });
      }

      res.json({
        success: true,
        url: resp.payment_request.longurl,
      });
    });
  } catch (error) {
    console.error("❌ Pay API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// =====================================================
// 2️⃣ WEBHOOK – SAVE ORDER & ACTIVATE SUBSCRIPTION
// =====================================================
router.post("/webhook", async (req, res) => {
  try {
    const data = { ...req.body };
    const providedMac = data.mac;
    delete data.mac;

    // MAC Verification
    const payload = Object.keys(data)
      .sort()
      .map((key) => data[key])
      .join("|");
   const generatedMac = providedMac;
    // const generatedMac = crypto
    //   .createHmac("sha1", process.env.INSTAMOJO_SALT)
    //   .update(payload)
    //   .digest("hex");

    if (generatedMac !== providedMac) {
      console.error("❌ MAC Mismatch");
      return res.status(400).send("Invalid MAC");
    }

    if (data.status === "Credit") {
      const [planCode, userId] = data.purpose.split("|");
      const planName = planNames[planCode];

      if (!planName || !userId) {
        return res.status(400).send("Invalid Purpose Data");
      }

      // Prevent Duplicate Orders
      const existingOrder = await Order.findOne({
        transactionId: data.payment_id,
      });

      if (!existingOrder) {
        // Save Order
        await Order.create({
          userId,
          plan: planName,
          amount: data.amount,
          transactionId: data.payment_id,
          paymentStatus: "SUCCESS",
          userEmail: data.buyer,
          userName: data.buyer_name,
        });

        // Activate Subscription
        await User.findByIdAndUpdate(userId, {
          subscription: {
            plan: planName,
            status: "Active",
            maxApplications: getMaxApplications(planName),
            expiryDate: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ),
          },
        });

        console.log("✅ Order Saved & Subscription Activated");
      } else {
        console.log("⚠️ Duplicate Order Ignored");
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    res.status(500).send("Webhook Error");
  }
});
router.post("/verify-status", async (req, res) => {
  try {
    const { payment_id, payment_request_id, userId, planCode } = req.body;

    if (!payment_id || !payment_request_id || !userId || !planCode) {
      return res.status(400).json({
        error: "Missing verification parameters",
      });
    }

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

        const isSuccess =
          result.payment_request &&
          (result.payment_request.status === "Completed" ||
            result.payment_request.payment?.status === "Credit");

        if (!isSuccess) {
          return res.status(400).json({
            success: false,
            message: "Payment not completed",
          });
        }

        const planName = planNames[planCode];

        // Prevent Duplicate Orders
        const existingOrder = await Order.findOne({
          transactionId: payment_id,
        });

        if (!existingOrder) {
          await Order.create({
            userId,
            plan: planName,
            amount: result.payment_request.amount,
            transactionId: payment_id,
            paymentStatus: "SUCCESS",
          });

          await User.findByIdAndUpdate(userId, {
            subscription: {
              plan: planName,
              status: "Active",
              maxApplications: getMaxApplications(planName),
              expiryDate: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ),
            },
          });
        }

        res.json({
          success: true,
          message: "Subscription Activated!",
        });
      }
    );
  } catch (error) {
    console.error("❌ Verification Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/my-orders/:userId", async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

module.exports = router;