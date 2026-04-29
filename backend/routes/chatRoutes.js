const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const authMiddleware = require("../middleware/chats"); // <-- auth middleware import

// ✅ Protect this route with authMiddleware
router.get("/:roomId", authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;

    const chats = await Chat.find({ roomId }).sort({ createdAt: 1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
