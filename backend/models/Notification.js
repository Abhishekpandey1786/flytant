const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: String,
  message: String,
  image: String, 
  imagePublicId: String,
  link: String,    
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);