const express = require("express");
const router = express.Router();
const Article = require("../models/Article"); // Model ko import karein

// 1. Get all articles
router.get("/", async (req, res) => {
  try {
    const articles = await Article.find().sort({ _id: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Post a new article
router.post("/", async (req, res) => {
  try {
    const newArticle = new Article(req.body);
    await newArticle.save();
    res.json({ message: "Article Added Successfully!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. Delete an article
router.delete("/:id", async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: "Article Deleted!" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;