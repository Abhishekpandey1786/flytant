const mongoose = require("mongoose");
const chatSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" }, // 👈 YE LINE ADD KARO
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: String,
  isRead: { type: Boolean, default: false },
}, { timestamps: true });