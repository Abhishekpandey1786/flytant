const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    planName: { type: String, required: true },
    amount: { type: Number, required: true },
    orderId: { type: String, required: true },
    paymentId: { type: String },
    status: { type: String, default: "pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
