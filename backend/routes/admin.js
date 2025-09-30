const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { Readable } = require("stream");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

const router = express.Router();

// 🌐 Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup (memory storage)
const storage = multer.memoryStorage();
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

// Helper: Upload image buffer to Cloudinary
const uploadToCloudinary = (buffer, folder = "notifications") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

// Add notification (with optional image)
router.post("/notifications", verifyAdmin, upload.single("image"), async (req, res) => {
  const { title, message, link } = req.body;
  let imageUrl = null;

  try {
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    if (!title && !message && !imageUrl)
      return res.status(400).json({ error: "Content required" });

    const notif = new Notification({ title, message, image: imageUrl, link });
    await notif.save();
    res.json({ success: true, notification: notif });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Cloudinary upload failed" });
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

// Delete notification
router.delete("/notifications/:id", verifyAdmin, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ error: "Notification not found" });

    // Optionally: Delete from Cloudinary (if needed)
    if (notif.image) {
      // Extract public_id from URL
      const segments = notif.image.split("/");
      const publicIdWithExt = segments[segments.length - 1];
      const publicId = publicIdWithExt.split(".")[0];
      await cloudinary.uploader.destroy(`notifications/${publicId}`, { resource_type: "image" });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
