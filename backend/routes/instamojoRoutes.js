// routes/instamojo.js (Aapki file)

const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Instamojo = require("instamojo-nodejs");
const User = require("../models/User");
const Order = require("../models/Order");

Instamojo.setKeys(process.env.INSTAMOJO_API_KEY, process.env.INSTAMOJO_AUTH_TOKEN);
Instamojo.isSandboxMode(false); // Live mode

const getMaxApplications = (plan) => {
    const limits = { Basic: 6, Standard: 15, Advance: 40, Premium: 9999 };
    return limits[plan] || 3;
};

// ✅ Create Payment Request
router.post("/pay", async (req, res) => {
    try {
        const { plan, userId, email, userName, phone } = req.body;

        // Validation check
        if (!plan || !userId) {
            return res.status(400).json({ error: "Missing plan or userId" });
        }

        const data = new Instamojo.PaymentData();
        data.purpose = `${plan.name} Plan Upgrade`;
        data.amount = plan.price;
        data.buyer_name = userName || "Client";
        data.email = email;
        data.phone = phone || "9999999999";
        data.send_email = true;
        data.send_sms = true;

        const redirectUrl = `${process.env.FRONTEND_URL}/payment-status?userId=${userId}&planName=${plan.name}`;
        data.setRedirectUrl(redirectUrl);
        data.webhook = `${process.env.BACKEND_URL}/api/instamojo/webhook`;

        Instamojo.createPayment(data, (error, response) => {
            if (error) {
                console.error("Instamojo Error:", error);
                return res.status(500).json({ error: "Payment link generation failed" });
            }
            // Response handle karein
            const responseData = typeof response === "string" ? JSON.parse(response) : response;
            
            if (responseData.success && responseData.payment_request) {
                res.json({ url: responseData.payment_request.longurl });
            } else {
                res.status(400).json({ error: "Invalid response from Instamojo" });
            }
        });
    } catch (error) {
        console.error("Internal Server Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Webhook (Backend to Backend)
// Note: Isse browser se call nahi kiya jata, Instamojo server direct call karega
router.post("/webhook", async (req, res) => {
    try {
        const data = req.body;
        const mac = data.mac;
        delete data.mac; // Mac calculate karne ke liye ise hatana hota hai

        // Instamojo webhook verification logic
        const keys = Object.keys(data).sort().map(key => data[key]);
        const payload = keys.join("|");
        const generatedMac = crypto
            .createHmac("sha1", process.env.INSTAMOJO_SALT)
            .update(payload)
            .digest("hex");

        // Note: Kuch versions mein simple concatenation chalti hai (jo aapne use ki thi)
        // Agar MAC mismatch ho, to niche wala payload use karein:
        // const payload = `${data.payment_request_id}|${data.payment_id}|${data.payment_status}`;

        if (payment_status === "Credit") {
             console.log("Payment Success for ID:", data.payment_id);
             // Yahan aap database update kar sakte hain redundancy ke liye
        }

        res.status(200).send("OK");
    } catch (error) {
        res.status(500).send("Webhook Error");
    }
});

// ✅ Verify Status (Frontend call karega)
router.post("/verify-status", async (req, res) => {
    const { payment_id, payment_request_id, userId, planName } = req.body;

    if(!payment_id || !payment_request_id) {
        return res.status(400).json({ error: "Missing IDs" });
    }

    Instamojo.getPaymentDetails(payment_request_id, payment_id, async (error, response) => {
        if (error) return res.status(500).json({ error });

        // Parse response if it's a string
        const result = typeof response === "string" ? JSON.parse(response) : response;

        if (result.payment_request && result.payment_request.status === "Completed") {
            try {
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
            } catch (err) {
                res.status(500).json({ error: "Database update failed" });
            }
        } else {
            res.status(400).json({ success: false, message: "Payment not completed" });
        }
    });
});

module.exports = router;