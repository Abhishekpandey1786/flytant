const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const User = require("../models/User"); // Assuming this path is correct
const Notification = require("../models/Notification"); // Assuming this path is correct
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

// --- SECURITY MIDDLEWARE ---
// 🔑 Admin token verification middleware (Improved)
const verifyAdmin = (req, res, next) => {
  // JWT Secret environment variable से लोड होना चाहिए
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error("FATAL: JWT_SECRET is not configured.");
    return res.status(500).json({ error: "Server configuration error." });
  }

  const authHeader = req.headers.authorization;
  
  // 1. Authorization header की जाँच करें
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Bearer token missing" });
  }

  // 2. Bearer token को निकालें
  const token = authHeader.split(" ")[1];
  
  try {
    // 3. टोकन को verify करें
    const decoded = jwt.verify(token, JWT_SECRET);

    // 4. Admin claim की जाँच करें (आपका JWT payload चेक)
    if (!decoded.admin) { 
      return res.status(403).json({ error: "Forbidden: Not an admin" });
    }

    // अगर सब सही है, तो आगे बढ़ें
    req.admin = decoded; // डिकोड किए गए एडमिन डेटा को स्टोर करें
    next();

  } catch (err) {
    // 5. एक्सपायरी या अमान्य टोकन को हैंडल करें
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired. Please log in again." });
    }
    return res.status(403).json({ error: "Invalid token" });
  }
};

// --- ROUTES ---

// Admin login
router.post("/login", (req, res) => {
  const { password } = req.body;
  // ADMIN_PASSWORD environment variable से लोड होना चाहिए
  if (password === process.env.ADMIN_PASSWORD) {
    // JWT payload में admin: true का उपयोग
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

// Helper: Upload image buffer to Cloudinary (unchanged)
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


router.get("/notifications", verifyAdmin, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/notifications/:id", verifyAdmin, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ error: "Notification not found" });

    if (notif.image) {
 
      const urlParts = notif.image.split('/');
      const publicIdWithFolder = 'notifications/' + urlParts[urlParts.length - 1].split('.')[0];
      await cloudinary.uploader.destroy(publicIdWithFolder, { resource_type: "image" });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;