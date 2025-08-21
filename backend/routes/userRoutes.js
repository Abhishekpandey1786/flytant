const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const protect = require("../middleware/authMiddleware");
const User = require("../models/User");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
  
    cb(null, path.join(__dirname, "..", "uploads", "avatars"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user._id}-${Date.now()}${ext}`);
  },
});
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG/PNG/WEBP allowed"), false);
};
const upload = multer({ storage, fileFilter });

// ✅ Get my profile
router.get("/me", protect, async (req, res) => {
  res.json({ user: req.user }); // req.user already without password
});

// ✅ Update my profile (text fields)
router.put("/me", protect, async (req, res) => {
  const allowedFields = [
    "businessName","contactPerson","industry","budget",
    "name","instagram","youtube","facebook","followers",
  ];
  const update = {};
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) update[f] = req.body[f];
  });

  const updated = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select("-password");
  res.json({ msg: "Profile updated", user: updated });
});

// ✅ Upload/Replace avatar
router.post("/me/avatar", protect, upload.single("avatar"), async (req, res) => {
  if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  const updated = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true }).select("-password");

  res.json({ msg: "Avatar uploaded", user: updated });
});

module.exports = router;