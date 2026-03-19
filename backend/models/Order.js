const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    userEmail: { type: String, required: true },
    userName: { type: String },
    userPhoneNo: { type: String },

    plan: {
      type: String,
      enum: ["Basic", "Standard", "Advance", "Premium"],
      required: true,
    },
    amount: { type: Number, required: true },

    orderId: { type: String, unique: true },
    phonepeOrderId: { type: String },      
    transactionId: { type: String },   

    paymentStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    responseData: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
