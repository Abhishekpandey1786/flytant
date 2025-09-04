const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Campaign = require('../models/Campaign');

router.get('/applied', auth, async (req, res) => {
  try {
   
    const campaigns = await Campaign.find({ 'applicants.user': req.user.id }).populate('createdBy', 'name');
    res.json(campaigns);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;