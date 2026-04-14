const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Instamojo = require("instamojo-nodejs");
const User = require("../models/User");
const Order = require("../models/Order");

// Live Keys Configuration
Instamojo.setKeys(process.env.INSTAMOJO_API_KEY, process.env.INSTAMOJO_AUTH_TOKEN);
Instamojo.isSandboxMode(false); // Strictly False for Live

const getMaxApplications = (plan) => {
    const limits = { Basic: 6, Standard: 15, Advance: 40, Premium: 9999 };
    return limits[plan] || 3;
};

// ✅ Create Payment Request
router.post("/pay", async (req, res) => {
    try {
        const { plan, userId, email, userName, phone } = req.body;

        // 1. PHONE VALIDATION (Live mode dummy numbers reject karta hai)
        // Phone exactly 10 digits ka hona chahiye, bina +91 ya zero ke.
        const cleanPhone = phone ? phone.toString().replace(/\D/g, '').slice(-10) : "";
        
        if (cleanPhone.length !== 10) {
            return res.status(400).json({ 
                error: "Please provide a valid 10-digit Indian phone number." 
            });
        }

        // 2. WEBHOOK & REDIRECT URL (Must be Public HTTPS)
        // Ensure BACKEND_URL in .env is "https://vistafluence.onrender.com" (No trailing slash)
        const backendBase = process.env.BACKEND_URL.replace(/\/$/, ""); 
        const webhookURL = `${backendBase}/api/instamojo/webhook`;

        const data = new Instamojo.PaymentData();
        data.purpose = `${plan.name} Plan Upgrade`;
        
        // Amount check: Instamojo live needs minimum ₹10
        // Agar frontend se $1 bhej rahe ho, to use 85 se multiply karo
        data.amount = plan.price < 10 ? (plan.price * 85).toFixed(2) : plan.price; 
        
        data.buyer_name = userName || "Customer";
        data.email = email.trim();
        data.phone = cleanPhone;
        data.send_email = true;
        data.send_sms = false; // Live mode mein SMS ke extra charges hote hain

        data.setRedirectUrl(`${process.env.FRONTEND_URL}/payment-status?userId=${userId}&planName=${plan.name}`);
        data.webhook = webhookURL;

        Instamojo.createPayment(data, (error, response) => {
            if (error) {
                // Ye log Render dashboard mein check karein exact reason ke liye
                console.error("Instamojo API Error:", error);
                return res.status(500).json({ error: "Instamojo rejected the request", details: error });
            }

            const responseData = typeof response === "string" ? JSON.parse(response) : response;

            if (responseData.success && responseData.payment_request) {
                res.json({ url: responseData.payment_request.longurl });
            } else {
                console.log("Instamojo Validation Failed:", responseData);
                res.status(400).json({ error: responseData.message || "Invalid Payment Request" });
            }
        });
    } catch (error) {
        console.error("Internal Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Webhook (Live Mode Security)
router.post("/webhook", async (req, res) => {
    try {
        const data = req.body;
        const mac = data.mac;
        delete data.mac;

        // MAC Verification
        const keys = Object.keys(data).sort().map(key => data[key]);
        const payload = keys.join("|");
        const generatedMac = crypto
            .createHmac("sha1", process.env.INSTAMOJO_SALT)
            .update(payload)
            .digest("hex");

        if (generatedMac !== mac) return res.status(400).send("Invalid MAC");

        if (data.status === "Credit") {
            console.log(`Payment successful for ${data.buyer_name}`);
        }

        res.status(200).send("OK");
    } catch (error) {
        res.status(500).send("Webhook Error");
    }
});

// ✅ Verify Status
router.post("/verify-status", async (req, res) => {
    const { payment_id, payment_request_id, userId, planName } = req.body;

    Instamojo.getPaymentDetails(payment_request_id, payment_id, async (error, response) => {
        if (error) return res.status(500).json({ error });

        const result = typeof response === "string" ? JSON.parse(response) : response;

        if (result.success && result.payment_request.status === "Completed") {
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
                res.status(500).json({ error: "Database error" });
            }
        } else {
            res.status(400).json({ success: false, message: "Payment incomplete" });
        }
    });
});

module.exports = router;