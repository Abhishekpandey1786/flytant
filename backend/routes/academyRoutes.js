const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // Password security ke liye
const AcademyUser = require("../models/AcademyUser");

// 🔥 Admin creates user (No Automatic Mail)
router.post("/create-user", async (req, res) => {
  const { email, password, plan, name } = req.body;

  try {
    // 1. Check if user already exists
    let user = await AcademyUser.findOne({ email });
    if (user) return res.status(400).json({ success: false, message: "User already exists!" });

    // 2. Password ko "Hash" karein (Ab DB mein asli password nahi dikhega)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Database mein save karein
    user = new AcademyUser({ 
      email, 
      password: hashedPassword, 
      name, 
      plan, 
      hasAccess: true // Aap manually bana rahe hain isliye access true
    });
    
    await user.save();

    // Ab koi Nodemailer code nahi hai, toh koi auto-mail nahi jayega.
    res.json({ success: true, message: "User created successfully in Database! ✅" });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
});

// 🔐 Academy User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await AcademyUser.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: "User not found!" });

    // Password check karein
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Ghalat details!" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      success: true, 
      token, 
      user: { name: user.name, hasAccess: user.hasAccess, plan: user.plan } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Login error" });
  }
});

module.exports = router;