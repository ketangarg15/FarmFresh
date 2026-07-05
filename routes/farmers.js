const express = require('express');
const router = express.Router();
const User = require('../models/user');

// All farmers page (JSON API)
router.get('/', async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' }).select('-salt -hash');
    res.json(farmers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Show a specific farmer profile (JSON API)
router.get('/:id', async (req, res) => {
  try {
    const farmer = await User.findOne({ _id: req.params.id, role: 'farmer' }).select('-salt -hash');
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }
    res.json(farmer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
