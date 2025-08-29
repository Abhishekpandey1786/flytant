// backend/news.js
const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

router.get("/top-headlines", async (req, res) => {
  try {
    const response = await fetch(
      "https://newsapi.org/v2/top-headlines?country=in&apiKey=14402fcfd6714c77a7a7faf79facfd93"
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
