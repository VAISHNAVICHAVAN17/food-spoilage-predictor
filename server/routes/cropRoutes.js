// routes/cropRoutes.js
const express = require('express');
const router = express.Router();
const Crop = require('../models/CropEntry');

// 📌 POST /api/crop/submit
router.post('/submit', async (req, res) => {
  try {
    const { 
      userId, 
      cropName, 
      cropStage, 
      soilType, 
      pesticideUsed, 
      irrigationType, 
      fertilizerUsed, 
      currentIssues, 
      durationDays,
      startDate,  // Receive from frontend
      endDate     // Receive from frontend
    } = req.body;

    if (!userId) return res.status(400).json({ error: 'User ID is required' });
    if (!startDate || !endDate) return res.status(400).json({ error: 'Start and end dates required' });

    console.log("========== BACKEND RECEIVED ==========");
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
    console.log("Duration Days:", durationDays);

    const crop = new Crop({
      userId,
      cropName,
      cropStage,
      soilType,
      pesticideUsed,
      irrigationType,
      fertilizerUsed,
      currentIssues,
      durationDays: Number(durationDays),
      startDate: new Date(startDate),  // Parse ISO string to Date
      endDate: new Date(endDate)       // Parse ISO string to Date
    });

    await crop.save();
    
    console.log("✅ SAVED TO DB:");
    console.log("Start Date:", crop.startDate);
    console.log("End Date:", crop.endDate);
    console.log("======================================");
    
    res.json({ message: 'Crop data saved successfully', crop });
  } catch (err) {
    console.error('❌ Error saving crop:', err);
    res.status(500).json({ error: 'Failed to save crop data', details: err.message });
  }
});

// 📌 GET /api/crop/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const crops = await Crop.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    
    console.log("========== FETCHING CROPS ==========");
    console.log("Found", crops.length, "crops");
    if (crops.length > 0) {
      console.log("First crop dates:");
      console.log("  Start:", crops[0].startDate);
      console.log("  End:", crops[0].endDate);
    }
    console.log("===================================");
    
    res.json(crops);
  } catch (err) {
    console.error('Error fetching crops:', err);
    res.status(500).json({ error: 'Failed to fetch crop data' });
  }
});

// 📌 PUT /api/crop/reschedule/:id
router.put('/reschedule/:id', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const updatedCrop = await Crop.findByIdAndUpdate(
      req.params.id,
      { 
        startDate: new Date(startDate), 
        endDate: new Date(endDate) 
      },
      { new: true }
    );
    if (!updatedCrop) {
      return res.status(404).json({ error: 'Crop not found' });
    }
    res.json({ message: 'Crop rescheduled successfully', crop: updatedCrop });
  } catch (err) {
    console.error('Error rescheduling crop:', err);
    res.status(500).json({ error: 'Failed to reschedule crop' });
  }
});

// 📌 DELETE /api/crop/delete/:id
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedCrop = await Crop.findByIdAndDelete(req.params.id);
    if (!deletedCrop) {
      return res.status(404).json({ error: 'Crop not found' });
    }
    res.json({ message: 'Crop deleted successfully' });
  } catch (err) {
    console.error('Error deleting crop:', err);
    res.status(500).json({ error: 'Failed to delete crop' });
  }
});

// 📌 DELETE /api/crop/delete-all/:userId
router.delete('/delete-all/:userId', async (req, res) => {
  try {
    const result = await Crop.deleteMany({ userId: req.params.userId });
    res.json({ message: 'All crop entries deleted', deletedCount: result.deletedCount });
  } catch (err) {
    console.error('Error deleting crops:', err);
    res.status(500).json({ error: 'Failed to delete crops' });
  }
});

module.exports = router;
