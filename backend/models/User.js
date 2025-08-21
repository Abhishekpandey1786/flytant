const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    userType: {
      type: String,
      enum: ["advertiser", "influencer"],
      required: true,
    },

    // Advertiser fields
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

    // Influencer fields
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

    // Common fields
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

     avatar: { type: String }, // /uploads/avatars/filename.png
  },
  { timestamps: true }
);

// Password hash middleware
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

// Password check method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
