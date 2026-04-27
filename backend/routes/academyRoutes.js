const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const AcademyUser = require("../models/AcademyUser");

// 🔒 Admin Verify Middleware
const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.admin) return res.status(403).json({ error: "Not Admin" });
    next();
  } catch (err) { res.status(403).json({ error: "Invalid Token" }); }
};

// 🔥 Admin creates user (Database + Safe Mail)
router.post("/create-user", verifyAdminToken, async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user already exists
    let user = await AcademyUser.findOne({ email });
    if (user) return res.status(400).json({ success: false, message: "Bhai, ye email pehle se exist karta hai!" });

    // 2. DB mein save karo
    user = new AcademyUser({ email, password });
    await user.save();

    // 3. Nodemailer (Mailing part ko try-catch mein rakha hai taaki server na phate)
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS, // Yahan Render wala lamba password aayega
        },
      });

      await transporter.sendMail({
        from: `"Vistafluence Academy" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Premium Academy Access 🎓",
        html: `<div style="font-family: sans-serif; background: #0f172a; color: white; padding: 20px; border-radius: 15px;">
                <h2 style="color: #d946ef;">Welcome to the Academy!</h2>
                <p>Account created successfully.</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password}</p>
                <br/>
                <a href="https://vistafluence.com/academy" style="background: #d946ef; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a>
              </div>`,
      });

      // Mail chala gaya
      return res.json({ success: true, message: "User created & Mail sent! ✅" });

    } catch (mailError) {
      console.error("NODEMAILER ERROR:", mailError.message);
      // User ban gaya par mail nahi gayi, phir bhi success bhej rahe hain
      return res.json({ success: true, message: "User created! (But mail failed, check App Password) ⚠️" });
    }

  } catch (err) {
    console.error("DATABASE ERROR:", err);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
});

// 🔐 Academy User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await AcademyUser.findOne({ email, password });
    if (user) {
      const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: "Ghalat details!" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

module.exports = router;