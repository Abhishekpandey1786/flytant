const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      enum: ["advertiser", "influencer"],
      required: true,
    },
    businessName: String,
    name: String,
    contactPerson: String,
    industry: String,
    budget: Number,
    instagram: String,
    youtube: String,
    facebook: String,
    followers: Number,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
