// backend/routes/news.js
const express = require("express");
const router = express.Router();

router.get("/top-headlines", async (req, res) => {
  try {
    const response = await fetch(
      "https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=14402fcfd6714c77a7a7faf79facfd93"
    );

    if (!response.ok) {
      throw new Error(`News API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ News API fetch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
