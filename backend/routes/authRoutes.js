const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

router.post("/signup", async (req, res) => {
  try {
    const { email, password, userType, businessName, contactPerson, name } =
      req.body;

    if (!email || !password || !userType) {
      return res
        .status(400)
        .json({ msg: "Email, password, and userType are required." });
    }
    if (userType === "advertiser" && (!businessName || !contactPerson)) {
      return res
        .status(400)
        .json({
          msg: "Business name and contact person are required for advertisers.",
        });
    }

    if (userType === "influencer" && !name) {
      return res.status(400).json({ msg: "Name is required for influencers." });
    }

    const existUser = await User.findOne({ email: email?.toLowerCase() });
    if (existUser) return res.status(400).json({ msg: "User already exists" });

    
    const newUser = await User.create({
      ...req.body,
      email: email.toLowerCase(),
      password,
    });

    const userSafe = newUser.toObject();
    delete userSafe.password;
    const token = generateToken(newUser._id);

    res
      .status(201)
      .json({ msg: "User registered successfully!", token, user: userSafe });
  } catch (err) {
    
    console.error("Signup error:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = generateToken(user._id);
    const userSafe = user.toObject();
    delete userSafe.password;

    res.status(200).json({ msg: "Login successful!", token, user: userSafe });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
