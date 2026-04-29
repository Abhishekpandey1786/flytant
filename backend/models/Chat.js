const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    // =========================
    // ROOM ID
    // =========================

    roomId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    // =========================
    // SENDER
    // =========================

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =========================
    // RECEIVER
    // =========================

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =========================
    // SENDER NAME
    // =========================

    senderName: {
      type: String,
      trim: true,
      default: "",
    },

    // =========================
    // SENDER AVATAR
    // =========================

    senderAvatar: {
      type: String,
      default: "",
    },

    // =========================
    // MESSAGE TEXT
    // =========================

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    // =========================
    // READ STATUS
    // =========================

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    // =========================
    // AUTO TIMESTAMPS
    // =========================

    timestamps: true,
  }
);

// =========================
// INDEXES
// =========================

chatSchema.index({
  roomId: 1,
  createdAt: 1,
});

// =========================
// EXPORT MODEL
// =========================

module.exports = mongoose.model(
  "Chat",
  chatSchema
);