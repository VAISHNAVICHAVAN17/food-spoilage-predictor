const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');

router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "userId query parameter required" });
    const batches = await Batch.find({ userId });
    res.json(batches);
  } catch (error) {
    console.error("Batch GET Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/', async (req, res) => {
  try {
    const batchData = req.body;
    if (!batchData.userId) return res.status(400).json({ message: "userId is required" });
    // Ensure only one batch per batchNumber
    const existingBatch = await Batch.findOne({ batchNumber: batchData.batchNumber });
    if (existingBatch) return res.status(400).json({ message: `Batch number '${batchData.batchNumber}' already exists.` });
    const newBatch = new Batch(batchData);
    await newBatch.save();
    res.status(201).json(newBatch);
  } catch (error) {
    console.error("Batch POST Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const batchId = req.params.id;
    const updatedData = req.body;
    const updatedBatch = await Batch.findByIdAndUpdate(batchId, updatedData, { new: true });
    if (!updatedBatch) return res.status(404).json({ message: 'Batch not found' });
    res.json(updatedBatch);
  } catch (error) {
    console.error("Batch PUT Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
