const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Campaign = require('../models/Campaign');
const auth = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload/campaign_images/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });


router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const { name, description, budget, platforms, requiredNiche, cta, endDate } = req.body;

        const newCampaign = new Campaign({
            name,
            description,
            budget,
            platforms: Array.isArray(platforms) ? platforms : [platforms],
            requiredNiche: Array.isArray(requiredNiche) ? requiredNiche : [requiredNiche],
            cta,
            endDate,
            imagePath: req.file ? req.file.path.replace(/\\/g, '/') : null,
            createdBy: req.user.id,
        });

        const campaign = await newCampaign.save();
        res.status(201).json(campaign);
    } catch (error) {
        console.error("Error creating campaign:", error.message);
        res.status(500).send('Server Error');
    }
});
router.get('/public', async (req, res) => {
    try {
        const campaigns = await Campaign.find()
            .populate('createdBy', 'name email') 
            .populate('applicants.user', 'name email ') 
            .sort({ createdAt: -1 });

        res.json(campaigns);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
router.post('/:campaignId/apply', auth, async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.campaignId);

        if (!campaign) {
            return res.status(404).json({ msg: 'Campaign not found' });
        }
        if (campaign.applicants.some(applicant => applicant.user.toString() === req.user.id)) {
            return res.status(400).json({ msg: 'You have already applied for this campaign' });
        }
        campaign.applicants.unshift({ user: req.user.id });
        await campaign.save();
        const updatedCampaign = await Campaign.findById(req.params.campaignId)
            .populate('createdBy', 'name email ')
            .populate('applicants.user', 'name email ');

        res.json({ msg: 'Applied successfully!', campaign: updatedCampaign });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
