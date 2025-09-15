const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const Notification = require("../models/Notification");
require("dotenv").config();

const router = express.Router();

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/Notifications");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Admin token verification middleware
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.admin) return res.status(403).json({ error: "Not admin" });
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

// Admin login
router.post("/login", (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: "8h" });
    return res.json({ success: true, token });
  }
  return res.status(401).json({ error: "Invalid password" });
});

// Stats
router.get("/stats", verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPayments = await User.countDocuments({ paid: true });
    res.json({ users: totalUsers, payments: totalPayments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add notification (with optional image)
router.post("/notifications", verifyAdmin, upload.single("image"), async (req, res) => {
  const { title, message, link } = req.body;
  const image = req.file ? `/uploads/Notifications/${req.file.filename}` : null;

  if (!title && !message && !image) return res.status(400).json({ error: "Content required" });

  try {
    const notif = new Notification({ title, message, image, link });
    await notif.save();
    res.json({ success: true, notification: notif });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all notifications
router.get("/notifications", verifyAdmin, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete notification with image
router.delete("/notifications/:id", verifyAdmin, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ error: "Notification not found" });

    // Delete image file if exists
    if (notif.image) {
      const imagePath = path.join(__dirname, "..", notif.image);
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Error deleting image:", err);
      });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
