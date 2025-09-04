const express = require("express");
const router = express.Router();
const User = require("../models/User"); 
router.get("/brands", async (req, res) => {
  try {
    const brands = await User.find({ userType: "advertiser" }).select(
      "-password -__v"
    );
    if (!brands || brands.length === 0) {
      return res.status(404).json({ msg: "No brands found" });
    }
    res.json(brands);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;


