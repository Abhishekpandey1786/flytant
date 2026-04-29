const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const authMiddleware = require("../middleware/chats"); 

// ✅ roomId के आधार पर मैसेज प्राप्त करें (Sorted and Populated)
router.get("/:roomId", authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;

    // प्रोफेशनल टिप: .limit(50) का उपयोग करें अगर मैसेज बहुत ज्यादा हों
    const chats = await Chat.find({ roomId })
      .sort({ createdAt: 1 })
      .lean(); // .lean() परफॉरमेंस को बेहतर बनाता है

    res.status(200).json(chats);
  } catch (error) {
    console.error("Backend Chat Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;