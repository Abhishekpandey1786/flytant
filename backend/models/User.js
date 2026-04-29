const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      enum: ["advertiser", "influencer"],
      required: true,
    },
    businessName: {
      type: String,
      required: function () {
        return this.userType === "advertiser";
      },
    },
    contactPerson: {
      type: String,
      required: function () {
        return this.userType === "advertiser";
      },
    },
    industry: String,
    budget: Number,

    name: {
      type: String,
      required: function () {
        return this.userType === "influencer";
      },
    },
    instagram: String,
    youtube: String,
    facebook: String,
    followers: Number,
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    avatar: { type: String },
    subscription: {
      plan: {
        type: String,
        default: "Free",
        enum: ["Free", "Basic", "Standard", "Advance", "Premium"],
      },
      maxApplications: { type: Number, default: 3 },
      applications_made_this_month: { type: Number, default: 0 },
      expiryDate: { type: Date, default: null },
      status: { type: String, default: "Inactive" },
      last_reset_date: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
module.exports = mongoose.model("User", userSchema);
