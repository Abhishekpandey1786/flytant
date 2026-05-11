const express = require("express");
const router = express.Router();
const Article = require("../models/Article");

router.get("/", async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch articles",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();

    res.status(201).json({
      message: "Article Added Successfully",
      article,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error creating article",
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Article.findByIdAndDelete(req.params.id);

    res.json({
      message: "Article Deleted Successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Delete Failed",
      error: error.message,
    });
  }
});

module.exports = router;