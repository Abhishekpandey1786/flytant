const express = require("express");

const router = express.Router();

const Chat = require("../models/Chat");

const authMiddleware = require("../middleware/chats");

// =======================================
// GET CHAT HISTORY
// =======================================

router.get(
  "/:roomId",
  authMiddleware,
  async (req, res) => {
    try {
      const { roomId } = req.params;

      // =========================
      // VALIDATION
      // =========================

      if (!roomId) {
        return res.status(400).json({
          success: false,
          message: "Room ID is required",
        });
      }

      // =========================
      // FETCH CHATS
      // =========================

      const chats = await Chat.find({
        roomId,
      })
        .sort({ createdAt: 1 })
        .lean();

      // =========================
      // RESPONSE
      // =========================

      return res.status(200).json(chats);

    } catch (error) {
      console.error(
        "❌ Error fetching chats:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to fetch chats",
      });
    }
  }
);

// =======================================
// DELETE CHAT ROOM (OPTIONAL)
// =======================================

router.delete(
  "/:roomId",
  authMiddleware,
  async (req, res) => {
    try {
      const { roomId } = req.params;

      if (!roomId) {
        return res.status(400).json({
          success: false,
          message: "Room ID is required",
        });
      }

      await Chat.deleteMany({ roomId });

      return res.status(200).json({
        success: true,
        message: "Chat deleted successfully",
      });

    } catch (error) {
      console.error(
        "❌ Error deleting chats:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to delete chats",
      });
    }
  }
);

module.exports = router;