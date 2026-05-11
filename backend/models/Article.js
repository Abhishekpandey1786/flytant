const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  author: String,
  category: String,
  date: { type: String, default: new Date().toLocaleDateString() }
});

module.exports = mongoose.model("Article", articleSchema);