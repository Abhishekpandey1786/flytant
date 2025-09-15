// models/Adminm.js
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: { type: String, default: "Admin" },
  email: String,
  paid: { type: Boolean, default: false },
});

module.exports = mongoose.models.Adminm || mongoose.model("Adminm", adminSchema);
