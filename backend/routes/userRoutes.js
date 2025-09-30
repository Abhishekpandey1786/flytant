const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const protect = require("../middleware/authMiddleware");
const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

// 🌐 Cloudinary config from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup for memory storage (no local files)
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG/PNG/WEBP allowed"), false);
};
const upload = multer({ storage, fileFilter });

// ✅ Get my profile
router.get("/me", protect, async (req, res) => {
  res.json({ user: req.user });
});

// ✅ Update profile fields
router.put("/me", protect, async (req, res) => {
  const allowedFields = [
    "businessName", "contactPerson", "industry", "budget",
    "name", "instagram", "youtube", "facebook", "followers",
  ];
  const update = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) update[f] = req.body[f];
  });

  const updated = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select("-password");
  res.json({ msg: "Profile updated", user: updated });
});

// ✅ Upload avatar to Cloudinary
router.post("/me/avatar", protect, upload.single("avatar"), async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

  try {
    // Convert buffer to stream for Cloudinary upload
    const streamUpload = (buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "avatars", public_id: `${req.user._id}-${Date.now()}` },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        const readable = new Readable();
        readable._read = () => {}; // _read is required but can be a noop
        readable.push(buffer);
        readable.push(null);
        readable.pipe(stream);
      });
    };

    const result = await streamUpload(req.file.buffer);

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    ).select("-password");

    res.json({ msg: "Avatar uploaded to Cloudinary", user: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Cloudinary upload failed", error });
  }
});

module.exports = router;
