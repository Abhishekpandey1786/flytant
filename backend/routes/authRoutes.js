const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existUser = await User.findOne({ email });
    if (existUser) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ ...req.body, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ msg: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});
// ✅ Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check user exist karta hai ya nahi
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // 2. Password compare karo
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // 3. Success response
    res.status(200).json({ msg: "Login successful!", user });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
