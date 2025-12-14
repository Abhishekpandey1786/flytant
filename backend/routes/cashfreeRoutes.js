const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();
const {
  StandardCheckoutClient,
  Env,
  StandardCheckoutPayRequest,
  RefundRequest,
  MetaInfo,
} = require("pg-sdk-node");
const { randomUUID } = require("crypto");

const Order = require("../models/Order"); 
const User = require("../models/User"); 
const CLIENT_ID = process.env.PHONEPE_CLIENT_ID; 
const CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET; 
const CLIENT_VERSION = "1.0"; 
const MERCHANT_USERNAME = process.env.PHONEPE_MERCHANT_USERNAME; 
const MERCHANT_PASSWORD = process.env.PHONEPE_MERCHANT_PASSWORD; 

const isProduction = process.env.NODE_ENV === "production";
const env = isProduction ? Env.PRODUCTION : Env.SANDBOX;
const client = StandardCheckoutClient.getInstance(
  CLIENT_ID,
  CLIENT_SECRET,
  CLIENT_VERSION,
  env
);
const planDetails = {
  Basic: { amount: 3, maxApplications: 6, dmCredits: 0 },
  Standard: { amount: 5, maxApplications: 15, dmCredits: 15 },
  Advance: { amount: 9, maxApplications: 40, dmCredits: 40 },
  Premium: { amount: 19, maxApplications: 9999, dmCredits: 9999 }, 
};
const updateSubscription = async (userId, planName) => {
  const details = planDetails[planName];
  if (!details) return false;

  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 1);

  const updateData = {
    "subscription.plan": planName,
    "subscription.maxApplications": details.maxApplications,
    "subscription.dmCredits": details.dmCredits,
    "subscription.expiryDate": expiryDate,
    "subscription.status": "Active",
  };

  await User.findByIdAndUpdate(userId, updateData);
  console.log(`Subscription updated for user ${userId} to ${planName}`);
  return true;
};
router.post("/create-payment", async (req, res) => {
  try {
    const { plan, userId, name, email, phone } = req.body;
    if (!plan || !userId || !name || !email || !phone)
      return res.status(400).json({ error: "Missing required fields" });

    const selectedPlan = planDetails[plan];
    if (!selectedPlan)
      return res.status(400).json({ error: "Invalid plan selected" });

    const amountInPaise = selectedPlan.amount * 100;
    const merchantOrderId = randomUUID();
    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amountInPaise)
      .redirectUrl(
        `https://vistafluence.com/payment-status?order_id=${merchantOrderId}`
      )
      .metaInfo(MetaInfo.builder().udf1(userId).udf2(plan).build()) 
      .build();
    const response = await client.pay(request);

    if (!response.redirectUrl)
      return res
        .status(500)
        .json({ error: "PhonePe Payment Init Failed", details: response });
    await Order.create({
      userId, 
      userEmail: email,
      userName: name, 
      userPhoneNo: phone, 
      plan,
      amount: selectedPlan.amount,
      orderId: merchantOrderId,
      paymentStatus: "PENDING",
      responseData: response,
    });

    res.json({
      success: true,
      redirectUrl: response.redirectUrl,
      orderId: merchantOrderId,
    });
  } catch (err) {
    console.error("❌ Payment creation failed:", err.message);
    res.status(500).json({ error: "Payment creation failed" });
  }
});
router.post("/webhook", express.text({ type: "*/*" }), async (req, res) => {
  try {
    const authorizationHeaderData =
      req.headers["authorization"] || req.headers["x-verify"];
    const phonepeS2SCallbackResponseBodyString = req.body;

    if (!authorizationHeaderData || !phonepeS2SCallbackResponseBodyString) {
      console.log("❌ Missing webhook headers/body");
      return res.status(200).send();
    }
    const callbackResponse = client.validateCallback(
      MERCHANT_USERNAME, 
      MERCHANT_PASSWORD, 
      authorizationHeaderData,
      phonepeS2SCallbackResponseBodyString
    );

    if (!callbackResponse || !callbackResponse.payload) {
      console.log("❌ Webhook Validation Failed by SDK");
      return res.status(200).send();
    }

    const payload = callbackResponse.payload;
    const merchantTransactionId = payload.merchantOrderId;
    const state = payload.state; 

    const order = await Order.findOne({ orderId: merchantTransactionId });
    if (!order) return res.status(200).send();

    let paymentStatus = order.paymentStatus;
    if (state === "ORDER_COMPLETED") {
      paymentStatus = "SUCCESS";
      if (order.paymentStatus !== "SUCCESS") {
        await updateSubscription(order.userId, order.plan);
      }
    } else if (state.includes("FAILED")) {
      paymentStatus = "FAILED";
    }

    await Order.findOneAndUpdate(
      { orderId: merchantTransactionId },
      {
        paymentStatus,
        transactionId: payload.transactionId,
        phonepeOrderId: payload.orderId,
        responseData: payload,
      },
      { new: true }
    );

    console.log(`Webhook Updated: ${merchantTransactionId} → ${paymentStatus}`);
    res.status(200).send();
  } catch (err) {
    console.error("❌ Webhook Error:", err.message);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/status", async (req, res) => {
  try {
    const orderId = req.query.order_id;
    if (!orderId) return res.status(400).json({ error: "Missing orderId" });

    const order = await Order.findOne({ orderId });
    if (!order) return res.status(404).json({ error: "Order not found" });

    const response = await client.getOrderStatus(orderId);
    const phonePeState = response.state;

    let newStatus = order.paymentStatus;

    if (phonePeState === "ORDER_COMPLETED") {
      newStatus = "SUCCESS";
      
      if (order.paymentStatus !== "SUCCESS") {
        await updateSubscription(order.userId, order.plan);
      }
    } else if (
      phonePeState.includes("FAILED") ||
      phonePeState === "ORDER_CANCELLED"
    ) {
      newStatus = "FAILED";
    } else {
      newStatus = "PENDING";
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      {
        paymentStatus: newStatus,
        transactionId: response.transactionId,
        phonepeOrderId: response.orderId,
      },
      { new: true }
    );

    res.json({
      orderId,
      status: updatedOrder.paymentStatus,
      amount: updatedOrder.amount,
      updated: true,
    });
  } catch (err) {
    console.error("❌ Status check failed:", err.message);
    res.status(500).json({ error: "Status check failed" });
  }
});

module.exports = router;