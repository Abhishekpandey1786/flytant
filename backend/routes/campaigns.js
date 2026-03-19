const express = require("express");
const router = express.Router();
const multer = require("multer");
const { Readable } = require("stream");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const Campaign = require("../models/Campaign");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToCloudinary = (buffer, folder = "campaign_images") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

const checkAndResetSubscription = (user) => {
  const now = new Date();
  let shouldSave = false;
  if (!user.subscription || user.subscription.plan === undefined) {
    user.subscription = {
      plan: "Free",
      status: "Active",
      maxApplications: 3,
      applications_made_this_month: 0,
      last_reset_date: now,
    };
    shouldSave = true;
    return shouldSave;
  }
  const lastReset = user.subscription.last_reset_date
    ? new Date(user.subscription.last_reset_date)
    : new Date(0);
  const expiryDate = user.subscription.expiryDate;
  if (expiryDate && now > expiryDate) {
    user.subscription.status = "Inactive";
    user.subscription.plan = "Free";
    user.subscription.maxApplications = 3;

    user.subscription.applications_made_this_month = 0;
    user.subscription.last_reset_date = now;
    shouldSave = true;
    return shouldSave;
  }
  if (
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear()
  ) {
    user.subscription.applications_made_this_month = 0;
    user.subscription.last_reset_date = now;
    shouldSave = true;
    if (!user.subscription.maxApplications) {
      user.subscription.maxApplications = 3;
      shouldSave = true;
    }
  }
  return shouldSave;
};
router.post(
  "/",
  auth,
  roleMiddleware("advertiser"),
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        name,
        description,
        budget,
        platforms,
        requiredNiche,
        cta,
        endDate,
      } = req.body;
      let imageUrl = null;
      if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer);
        imageUrl = result.secure_url;
      }

      const newCampaign = new Campaign({
        name,
        description,
        budget,
        platforms: Array.isArray(platforms) ? platforms : [platforms],
        requiredNiche: Array.isArray(requiredNiche)
          ? requiredNiche
          : [requiredNiche],
        cta,
        endDate,
        imagePath: imageUrl,
        createdBy: req.user.id,
      });

      const campaign = await newCampaign.save();
      res.status(201).json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error.message);
      res.status(500).send("Server Error");
    }
  }
);

router.get("/public", async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate("createdBy", "name email")
      .populate("applicants.user", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(campaigns);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/:campaignId/apply", auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);
    const userDoc = await User.findById(req.user.id);

    if (!campaign) return res.status(404).json({ msg: "Campaign not found" });
    if (!userDoc) return res.status(404).json({ msg: "User not found" });
    if (userDoc.userType === "influencer") {
      const needsSave = checkAndResetSubscription(userDoc);
      if (needsSave) {
        await userDoc.save();
      }
    }

    if (userDoc.userType === "influencer") {
      const maxApps = userDoc.subscription.maxApplications || 3;
      const appsMade = userDoc.subscription.applications_made_this_month || 0;
      if (appsMade >= maxApps && maxApps < 9999) {
        return res.status(403).json({
          msg: `Your ${userDoc.subscription.plan} plan allows only ${maxApps} applications this month. Please upgrade.`,
          redirect: "/SubscriptionPlans",
        });
      }
    }
    if (
      campaign.applicants.some(
        (applicant) => applicant.user.toString() === req.user.id
      )
    ) {
      return res
        .status(400)
        .json({ msg: "You have already applied for this campaign" });
    }

    campaign.applicants.unshift({ user: req.user.id });
    if (userDoc.userType === "influencer") {
      userDoc.subscription.applications_made_this_month += 1;
    }
    await campaign.save();
    await userDoc.save();

    const updatedCampaign = await Campaign.findById(req.params.campaignId)
      .populate("createdBy", "name email")
      .populate("applicants.user", "name email avatar");
    res.json({
      msg: "Applied successfully!",
      campaign: updatedCampaign,
      newApplicationCount: userDoc.subscription.applications_made_this_month,
      newMaxApplications: userDoc.subscription.maxApplications,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
