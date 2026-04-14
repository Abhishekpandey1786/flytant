const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Instamojo = require("instamojo-nodejs");
const User = require("../models/User");
const Order = require("../models/Order");

// Live Keys Configuration
Instamojo.setKeys(process.env.INSTAMOJO_API_KEY, process.env.INSTAMOJO_AUTH_TOKEN);
Instamojo.isSandboxMode(false); 

const getMaxApplications = (plan) => {
    const limits = { Basic: 6, Standard: 15, Advance: 40, Premium: 9999 };
    return limits[plan] || 3;
};

// ✅ Create Payment Request
router.post("/pay", async (req, res) => {
    try {
        const { plan, userId, email, userName, phone } = req.body;

        // 1. SAFETY: URL Undefined Check
        const frontendBase = (process.env.FRONTEND_URL || "https://vistafluence.com").replace(/\/$/, "");
        const backendBase = (process.env.BACKEND_URL || "https://vistafluence.onrender.com").replace(/\/$/, "");

        // 2. PHONE VALIDATION: Live API 9999999999 ko block karti hai
        // Phone must be exactly 10 digits
        let cleanPhone = phone ? phone.toString().replace(/\D/g, '').slice(-10) : "";
        if (cleanPhone.length !== 10) {
            // Agar phone nahi hai, toh ek valid formatted testing number (sirf debug ke liye)
            cleanPhone = "9876543210"; 
        }

        const data = new Instamojo.PaymentData();
        data.purpose = `${plan.name} Plan Upgrade`;
        
        // 3. AMOUNT LOGIC: Instamojo only takes INR (Min ₹10)
        // Agar frontend se $1 aa raha hai, toh ₹85 convert karega
        const conversionRate = 85; 
        const amountInINR = plan.price < 10 ? (plan.price * conversionRate).toFixed(2) : plan.price.toFixed(2);
        
        data.amount = amountInINR;
        data.buyer_name = userName || "Customer";
        data.email = email ? email.trim() : "customer@example.com";
        data.phone = cleanPhone;
        data.send_email = true;
        data.send_sms = false; 

        data.setRedirectUrl(`${frontendBase}/payment-status?userId=${userId}&planName=${plan.name}`);
        data.webhook = `${backendBase}/api/instamojo/webhook`;

        Instamojo.createPayment(data, (error, response) => {
            if (error) {
                // Ye log Render dashboard mein sabse important hai
                console.error("INSTAMOJO REJECTION DETAILS:", error);
                return res.status(400).json({ error: "Instamojo rejected the request", details: error });
            }

            try {
                const responseData = typeof response === "string" ? JSON.parse(response) : response;
                if (responseData.success && responseData.payment_request) {
                    res.json({ url: responseData.payment_request.longurl });
                } else {
                    res.status(400).json({ error: responseData.message || "Invalid Data" });
                }
            } catch (e) {
                res.status(500).json({ error: "Parsing error" });
            }
        });
    } catch (error) {
        console.error("INTERNAL SERVER ERROR:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Webhook (Backend to Backend)
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

        if (generatedMac === mac && data.status === "Credit") {
            console.log("✅ Payment Verified via Webhook:", data.payment_id);
        }
        res.status(200).send("OK");
    } catch (error) {
        res.status(500).send("Webhook Error");
    }
});

module.exports = router;