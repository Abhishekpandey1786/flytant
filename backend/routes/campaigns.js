const express = require('express');
const router = express.Router();
const multer = require('multer');
const Campaign = require('../models/Campaign');
const auth = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { Readable } = require('stream');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// 🌐 Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper: Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder = 'campaign_images') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
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

// Create campaign
router.post('/', auth, roleMiddleware("advertiser"), upload.single('image'), async (req, res) => {
  try {
    const { name, description, budget, platforms, requiredNiche, cta, endDate } = req.body;

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
      requiredNiche: Array.isArray(requiredNiche) ? requiredNiche : [requiredNiche],
      cta,
      endDate,
      imagePath: imageUrl,
      createdBy: req.user.id,
    });

    const campaign = await newCampaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    console.error("Error creating campaign:", error.message);
    res.status(500).send('Server Error');
  }
});

// Get all public campaigns
router.get('/public', async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate('createdBy', 'name email')
      .populate('applicants.user', 'name email')
      .sort({ createdAt: -1 });

    res.json(campaigns);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Apply to a campaign
router.post('/:campaignId/apply', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.campaignId);

    if (!campaign) return res.status(404).json({ msg: 'Campaign not found' });

    if (campaign.applicants.some(applicant => applicant.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'You have already applied for this campaign' });
    }

    campaign.applicants.unshift({ user: req.user.id });
    await campaign.save();

    const updatedCampaign = await Campaign.findById(req.params.campaignId)
      .populate('createdBy', 'name email')
      .populate('applicants.user', 'name email');

    res.json({ msg: 'Applied successfully!', campaign: updatedCampaign });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
