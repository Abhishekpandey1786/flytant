const express = require("express");
const router = express.Router();

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const Article = require("../models/Article");

// =======================================
// CLOUDINARY CONFIG
// =======================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =======================================
// MULTER STORAGE
// =======================================
const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + "-" + file.originalname
    );
  },
});

const upload = multer({
  storage,
});

// =======================================
// GET ARTICLES
// =======================================
router.get("/", async (req, res) => {
  try {

    const articles = await Article.find().sort({
      createdAt: -1,
    });

    res.status(200).json(articles);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
});

// =======================================
// ADD ARTICLE
// =======================================
router.post(
  "/",
  upload.single("image"),
  async (req, res) => {

    try {

      // ==============================
      // UPLOAD IMAGE TO CLOUDINARY
      // ==============================
      const uploadedImage =
        await cloudinary.uploader.upload(
          req.file.path,
          {
            folder: "vistafluence_articles",
          }
        );

      // ==============================
      // SAVE ARTICLE
      // ==============================
      const article = new Article({
        title: req.body.title,
        description: req.body.description,
        author: req.body.author,
        category: req.body.category,
        image: uploadedImage.secure_url,
      });

      await article.save();

      // ==============================
      // DELETE LOCAL FILE
      // ==============================
      fs.unlinkSync(req.file.path);

      res.status(201).json({
        message: "Article Added Successfully",
        article,
      });

    } catch (error) {

      console.log(error);

      res.status(500).json({
        message: "Upload Failed",
        error: error.message,
      });
    }
  }
);

// =======================================
// DELETE ARTICLE
// =======================================
router.delete("/:id", async (req, res) => {

  try {

    await Article.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Article Deleted Successfully",
    });

  } catch (error) {

    res.status(400).json({
      message: "Delete Failed",
      error: error.message,
    });
  }
});

module.exports = router;