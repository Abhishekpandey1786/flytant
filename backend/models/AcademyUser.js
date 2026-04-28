const mongoose = require("mongoose");

const AcademyUserSchema = new mongoose.Schema({
  name: { type: String, default: "Student" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  plan: { type: String, default: "Free" }, // ₹499 ya ₹1000 yahan save hoga
  hasAccess: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AcademyUser", AcademyUserSchema);