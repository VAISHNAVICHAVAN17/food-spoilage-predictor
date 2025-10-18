const express = require('express');
const Crop = require('../models/Crop'); // You need to create this model
const router = express.Router();


// Save crop data
router.post('/submit', async (req, res) => {
  try {
    console.log("Incoming crop data:", req.body);  // log full incoming request body

    const crop = new Crop(req.body); // this is likely where the error happens
    const saved = await crop.save();

    res.status(201).json(saved);
  } catch (err) {
    console.error('🔥 Crop submission error:', err); // log the error
    res.status(500).json({ message: 'Failed to save crop data', error: err.message });
  }
});




// Get crop data by userId
router.get('/user/:userId', async (req, res) => {
  try {
    const crops = await Crop.find({ userId: req.params.userId });
    res.status(200).json(crops);
  } catch (err) {
    console.error('Fetch crop history error:', err);
    res.status(500).json({ message: 'Failed to fetch crop history' });
  }
});

// DELETE crop entry by ID
router.delete('/delete/:id', async (req, res) => {
  try {
    const deleted = await Crop.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Crop not found' });
    }
    res.status(200).json({ message: 'Crop deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Failed to delete crop entry' });
  }
});

// Delete all crop entries for a user
// DELETE all crops for a user
router.delete('/delete-all/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await Crop.deleteMany({ userId });
    res.status(200).json({
      message: 'All crop records deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error('Error deleting all crop records:', err);
    res.status(500).json({ message: 'Failed to delete crop records', error: err.message });
  }
});



module.exports = router;
