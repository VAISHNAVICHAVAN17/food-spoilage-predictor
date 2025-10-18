// server/routes/cropRoutes.js
const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');

// 📌 POST /api/crop/submit
router.post('/submit', async (req, res) => {
  try {
    const { userId, cropName, cropStage, soilType, pesticideUsed, irrigationType, fertilizerUsed, currentIssues, durationDays } = req.body;

    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const startDate = new Date();
    const endDate = durationDays ? new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000) : null;

    const crop = new Crop({
      userId,
      cropName,
      cropStage,
      soilType,
      pesticideUsed,
      irrigationType,
      fertilizerUsed,
      currentIssues,
      startDate,
      endDate
    });

    await crop.save();
    res.json({ message: 'Crop data saved successfully', crop });
  } catch (err) {
    console.error('Error saving crop:', err);
    res.status(500).json({ error: 'Failed to save crop data' });
  }
});

// 📌 GET /api/crop/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const crops = await Crop.find({ userId: req.params.userId });
    res.json(crops);
  } catch (err) {
    console.error('Error fetching crops:', err);
    res.status(500).json({ error: 'Failed to fetch crop data' });
  }
});

// 📌 DELETE all crops for a user
router.delete('/delete-all/:userId', async (req, res) => {
  try {
    await Crop.deleteMany({ userId: req.params.userId });
    res.json({ message: 'All crop entries deleted' });
  } catch (err) {
    console.error('Error deleting crops:', err);
    res.status(500).json({ error: 'Failed to delete crops' });
  }
});

module.exports = router;
