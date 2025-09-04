const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const auth = require('../middleware/authMiddleware');

router.get('/influencers', async (req, res) => {
    try {
        const influencers = await User.find({ userType: 'influencer' }).select('-password -__v');
        
        if (!influencers || influencers.length === 0) {
            return res.status(404).json({ msg: 'No influencers found' });
        }

        res.json(influencers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;