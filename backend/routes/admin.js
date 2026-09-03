const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const { Readable } = require("stream");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");
const Notification = require("../models/Notification");
const Campaign = require("../models/Campaign");
const { verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// 🌐 Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup (memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB cap
});

// --- RATE LIMITING for login ---
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Try again in 15 minutes." },
});

// --- ROUTES ---

// Admin login
router.post("/login", loginLimiter, (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password required" });
  }

  if (password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: "8h" });
    return res.json({ success: true, token });
  }
  return res.status(401).json({ error: "Invalid password" });
});

// Stats
// NOTE: still don't have your real User schema — adjust `paid` / `amount` /
// `createdAt` if those field names differ. `createdAt` needs
// `{ timestamps: true }` on the User schema to exist at all.
router.get("/stats", verifyAdmin, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalUsers, totalPayments, newSignups, revenueAgg] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ paid: true }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.aggregate([
        { $match: { paid: true } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const revenue = revenueAgg[0]?.total || 0;

    res.json({ users: totalUsers, payments: totalPayments, newSignups, revenue });
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
  let imagePublicId = null;

  try {
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    if (!title && !message && !imageUrl) {
      return res.status(400).json({ error: "Content required" });
    }

    const notif = new Notification({ title, message, image: imageUrl, imagePublicId, link });
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

    if (notif.imagePublicId) {
      // Reliable path: we stored the real public_id at upload time.
      await cloudinary.uploader.destroy(notif.imagePublicId, { resource_type: "image" });
    } else if (notif.image) {
      // Fallback for notifications created before imagePublicId existed.
      const urlParts = notif.image.split("/");
      const guessedPublicId = "notifications/" + urlParts[urlParts.length - 1].split(".")[0];
      await cloudinary.uploader.destroy(guessedPublicId, { resource_type: "image" });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Notification deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// --- CAMPAIGN APPROVAL SYSTEM ---

// 1. Get all Pending Campaigns
router.get("/campaigns/pending", verifyAdmin, async (req, res) => {
  try {
    const pendingCampaigns = await Campaign.find({ approvalStatus: "pending" })
      .populate("createdBy", "name businessName email")
      .populate("applicants.user", "name email")
      .sort({ createdAt: -1 });

    res.json(pendingCampaigns);
  } catch (err) {
    console.error("Fetch Pending Campaigns Error:", err);
    res.status(500).json({ error: "Failed to fetch pending campaigns" });
  }
});

// 2. Approve or Reject a Campaign
router.patch("/campaigns/:id/status", verifyAdmin, async (req, res) => {
  const { status, feedback } = req.body; // 'approved' | 'rejected'

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    campaign.approvalStatus = status;
    campaign.isActive = status === "approved";

    if (status === "rejected") {
      campaign.feedback = feedback || "";
      // Required for the schema's TTL index to actually clean this document
      // up 24h later — without this, rejected campaigns pile up forever.
      campaign.rejectedAt = new Date();
    } else {
      campaign.feedback = "";
      campaign.rejectedAt = null;
    }

    await campaign.save();

    res.json({
      success: true,
      message: `Campaign ${status} successfully!`,
      campaign,
    });
  } catch (err) {
    console.error("Update Campaign Status Error:", err);
    res.status(500).json({ error: "Server error during status update" });
  }
});

// 3. Delete a campaign from Admin panel
router.delete("/campaigns/:id", verifyAdmin, async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    res.json({ success: true, message: "Campaign deleted by Admin" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;