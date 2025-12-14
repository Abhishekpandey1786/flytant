const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'User' 
    },
    userEmail: String,
    userName: String,
    userPhoneNo: String,
    plan: String,
    amount: Number,

    orderId: String, 
    phonepeOrderId: String,
    transactionId: String,

    paymentStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    responseData: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);