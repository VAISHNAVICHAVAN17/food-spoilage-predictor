const express = require('express');
const router = express.Router();
const ImportExport = require('../models/ImportExport');
const Batch = require('../models/Batch');

router.post('/', async (req, res) => {
  try {
    const { batchId, type, quantity, movementDate, party } = req.body;
    if (!batchId || !type || !quantity || !movementDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be positive' });
    }
    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    if (type === 'export' && quantity > batch.quantityAvailable) {
      return res.status(400).json({ message: 'Insufficient inventory for export' });
    }
    batch.quantityAvailable += (type === 'import' ? quantity : -quantity);
    batch.lastUpdated = new Date();
    await batch.save();

    const record = new ImportExport({ batchId, type, quantity, movementDate, party, status: 'completed' });
    await record.save();

    res.status(201).json(record);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const records = await ImportExport.find().populate('batchId').sort({ movementDate: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
