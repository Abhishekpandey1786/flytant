const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();

const Order = require("../models/Order");
const { v4: uuidv4 } = require("uuid");

const {
  PhonePeClient,
  Env,
  StandardCheckoutRequest,
} = require("phonepe-sdk-nodejs");

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID;
const API_KEY = process.env.PHONEPE_API_KEY;
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || 1;
const isProduction = process.env.NODE_ENV === "production";

const phonepeClient = new PhonePeClient({
  merchantId: MERCHANT_ID,
  apiKey: API_KEY,
  saltIndex: SALT_INDEX,
  env: isProduction ? Env.PRODUCTION : Env.UAT,
});
router.post("/create-payment", async (req, res) => {
  try {
    const { amount, name, email, phone, plan } = req.body;

    const orderId = uuidv4().replace(/-/g, "").toUpperCase();
    const amountInPaise = amount * 100;

    const stdCheckoutReq = new StandardCheckoutRequest({
      merchantId: MERCHANT_ID,
      merchantTransactionId: orderId,
      amount: amountInPaise.toString(),
      redirectUrl: `https://vistafluence.com/payment-status?order_id=${orderId}`,
      callbackUrl: "https://vistafluence.com/api/payment/webhook",
      mobileNumber: phone,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    });

    const response = await phonepeClient.standardCheckout(stdCheckoutReq);

    if (!response.success || !response.data.instrumentResponse.redirectInfo.url) {
      return res.status(500).json({ error: "PhonePe Payment Init Failed" });
    }

    await Order.create({
      userEmail: email,
      userName: name,
      userPhoneNo: phone,
      plan,
      amount,
      orderId,
      phonepeOrderId: null,
      transactionId: null,
      paymentStatus: "PENDING",
      responseData: response,
    });

    res.json({
      success: true,
      redirectUrl: response.data.instrumentResponse.redirectInfo.url,
      orderId,
    });
  } catch (err) {
    res.status(500).json({ error: "Payment creation failed" });
  }
});
router.post("/webhook", express.json({ type: "*/*" }), async (req, res) => {
  try {
    const signature = req.headers["authorization"];
    const callbackType = req.headers["x-callback-type"];
    const payloadString = JSON.stringify(req.body);

    if (!signature || !callbackType) {
      console.log("❌ Missing headers");
      return res.status(200).send();
    }
    const verified = phonepeClient.validateCallback(signature, payloadString);

    if (!verified.success) {
      console.log("❌ Invalid webhook signature");
      return res.status(200).send();
    }

    const payload = verified.data;

    const {
      merchantTransactionId,
      transactionId,
      amount,
      state,
      orderId,
    } = payload;

    const findOrder = await Order.findOne({ orderId: merchantTransactionId });
    if (!findOrder) {
      console.log("❌ Order not found in database");
      return res.status(200).send();
    }

    let paymentStatus = "PENDING";
    if (state === "COMPLETED") paymentStatus = "SUCCESS";
    else if (state === "FAILED") paymentStatus = "FAILED";

    await Order.findOneAndUpdate(
      { orderId: merchantTransactionId },
      {
        paymentStatus,
        phonepeOrderId: orderId,
        transactionId,
      },
      { new: true }
    );

    console.log(`Webhook Updated: ${merchantTransactionId} → ${paymentStatus}`);

    return res.status(200).send(); // mandatory
  } catch (err) {
    console.log("❌ Webhook Error:", err);
    return res.status(200).send();
  }
});

router.get("/status", async (req, res) => {
  try {
    const orderId = req.query.order_id;

    if (!orderId) return res.status(400).json({ error: "Missing orderId" });

    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.paymentStatus !== "PENDING") {
      return res.json({
        orderId,
        amount: order.amount,
        status: order.paymentStatus,
        updated: true,
      });
    }
    const checkStatusResponse = await phonepeClient.getStatus({
      merchantId: MERCHANT_ID,
      merchantTransactionId: orderId,
    });

    if (!checkStatusResponse.success) {
      return res.json({ orderId, status: "PENDING", updated: false });
    }

    const status = checkStatusResponse.data.state === "COMPLETED" ? "SUCCESS" : 
                   checkStatusResponse.data.state === "FAILED" ? "FAILED" : "PENDING";

    await Order.findOneAndUpdate(
      { orderId },
      {
        paymentStatus: status,
        phonepeOrderId: checkStatusResponse.data.orderId,
        transactionId: checkStatusResponse.data.transactionId,
      }
    );

    res.json({
      orderId,
      status,
      updated: true,
    });
  } catch (err) {
    res.status(500).json({ error: "Status check failed" });
  }
});

module.exports = router;
