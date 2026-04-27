const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

// Temporary Store (Database ki jagah)
let academyUsers = [];

// 🔥 1. Admin creates user & sends password via email
router.post("/create-user", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Missing Data" });
  }

  // Memory mein save kiya
  academyUsers.push({ email, password });

  // Nodemailer Setup
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Vistafluence Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Academy Credentials 🔐",
      html: `<h3>Welcome!</h3><p>Email: ${email}</p><p>Pass: ${password}</p>`,
    });
    res.json({ success: true, message: "User created & Mail sent!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Email failed" });
  }
});

// 🔐 2. Academy User Login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = academyUsers.find(u => u.email === email && u.password === password);

  if (user) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

module.exports = router;