const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    senderName: String,
    senderAvatar: String,
    text: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);