const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Instamojo = require("instamojo-nodejs");
const User = require("../models/User");
const Order = require("../models/Order");

// API Keys Configuration
Instamojo.setKeys(process.env.INSTAMOJO_API_KEY, process.env.INSTAMOJO_AUTH_TOKEN);
Instamojo.isSandboxMode(false); // Live Mode

const getMaxApplications = (plan) => {
    const limits = { Basic: 6, Standard: 15, Advance: 40, Premium: 9999 };
    return limits[plan] || 3;
};

// ✅ Create Payment Request
router.post("/pay", async (req, res) => {
    try {
        const { plan, userId, email, userName, phone } = req.body;

        // --- URL SAFETY CHECK (Fixes the 'replace' error) ---
        const rawBackendUrl = process.env.BACKEND_URL || "https://vistafluence.onrender.com";
        const rawFrontendUrl = process.env.FRONTEND_URL || "https://vistafluence.com";
        
        const backendBase = rawBackendUrl.replace(/\/$/, ""); 
        const frontendBase = rawFrontendUrl.replace(/\/$/, "");
        // ----------------------------------------------------

        // 1. Phone Validation
        const cleanPhone = phone ? phone.toString().replace(/\D/g, '').slice(-10) : "";
        if (cleanPhone.length !== 10) {
            return res.status(400).json({ 
                error: "Please provide a valid 10-digit Indian phone number." 
            });
        }

        const data = new Instamojo.PaymentData();
        data.purpose = `${plan.name} Plan Upgrade`;
        
        // 2. Amount Validation (Min ₹10 for Instamojo)
        // Agar price $1 hai toh use ₹85 mein convert karega
        const finalAmount = plan.price < 10 ? (plan.price * 85).toFixed(2) : plan.price;
        data.amount = finalAmount;
        
        data.buyer_name = userName || "Customer";
        data.email = email ? email.trim() : "";
        data.phone = cleanPhone;
        data.send_email = true;
        data.send_sms = false; 

        data.setRedirectUrl(`${frontendBase}/payment-status?userId=${userId}&planName=${plan.name}`);
        data.webhook = `${backendBase}/api/instamojo/webhook`;

        Instamojo.createPayment(data, (error, response) => {
            if (error) {
                console.error("Instamojo API Error:", error);
                return res.status(500).json({ error: "Instamojo rejected the request", details: error });
            }

            try {
                const responseData = typeof response === "string" ? JSON.parse(response) : response;

                if (responseData.success && responseData.payment_request) {
                    res.json({ url: responseData.payment_request.longurl });
                } else {
                    console.error("Instamojo Validation Failed:", responseData);
                    res.status(400).json({ error: responseData.message || "Invalid Payment Request" });
                }
            } catch (parseErr) {
                res.status(500).json({ error: "Response parsing failed" });
            }
        });
    } catch (error) {
        console.error("Internal Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Webhook (Security)
router.post("/webhook", async (req, res) => {
    try {
        const data = req.body;
        const mac = data.mac;
        delete data.mac;

        const keys = Object.keys(data).sort().map(key => data[key]);
        const payload = keys.join("|");
        const generatedMac = crypto
            .createHmac("sha1", process.env.INSTAMOJO_SALT || "")
            .update(payload)
            .digest("hex");

        if (generatedMac !== mac) return res.status(400).send("Invalid MAC");

        if (data.status === "Credit") {
            console.log(`✅ Webhook: Payment successful for ${data.buyer_name}`);
        }

        res.status(200).send("OK");
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).send("Webhook Error");
    }
});

// ✅ Verify Status
router.post("/verify-status", async (req, res) => {
    try {
        const { payment_id, payment_request_id, userId, planName } = req.body;

        if (!payment_id || !payment_request_id) {
            return res.status(400).json({ error: "Missing Payment IDs" });
        }

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
    } catch (error) {
        res.status(500).json({ error: "Verification Failed" });
    }
});

module.exports = router;