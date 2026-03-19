const Order = require("../models/Order");
const User = require("../models/User");

const getMaxApplications = (plan) => {
  switch (plan) {
    case "Basic": return 6;
    case "Standard": return 15;
    case "Advance": return 40;
    case "Premium": return 9999;
    default: return 3;
  }
};

exports.paymentSuccess = async (session) => {
  const { userId, planName, userName, userPhoneNo, amount } = session.metadata;

  // Update User subscription
  const user = await User.findById(userId);
  if (user) {
    user.subscription.plan = planName;
    user.subscription.status = "Active";
    user.subscription.maxApplications = getMaxApplications(planName);
    user.subscription.applications_made_this_month = 0;
    user.subscription.last_reset_date = new Date();
    user.subscription.expiryDate = new Date(Date.now() + 30*24*60*60*1000);
    await user.save();
  }

  // Save Order
  const newOrder = new Order({
    userId,
    userEmail: session.customer_details?.email,
    userName,
    userPhoneNo,
    plan: planName,
    amount,
    orderId: session.id,
    transactionId: session.payment_intent,
    paymentStatus: "SUCCESS",
    responseData: session,
  });

  await newOrder.save();
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
