const express = require('express');
const router = express.Router();
const axios = require('axios');
const Prediction = require('../models/Prediction'); // Or your path for mongoose

// --- Default logic route ---
router.post('/', async (req, res) => {
  // ... your default prediction code ...
  // (keep your heuristics logic, OpenWeather fetch, etc, here)
});

// --- ML-based Shelf Life Prediction, with Business Capping ---
router.post('/mlpredict', async (req, res) => {
  try {
    const {
      cropType, amountKg, warehouseSizeSqm, city,
      temperature, humidity, insulation = 'average', refrigeration = false,
      baseRemainingDays, manufactureDate, expiryDate
    } = req.body;

    const features = {
      cropType,
      amountKg,
      warehouseSizeSqm,
      city,
      temperature,
      humidity,
      insulation,
      refrigeration: refrigeration ? 1 : 0,
      baseRemainingDays
    };

    const flaskResp = await axios.post('http://127.0.0.1:6000/predict', features);
    const predictedDays = Math.round(flaskResp.data.predictedShelfLifeDays);

    let predExpiry = new Date(manufactureDate);
    predExpiry.setDate(predExpiry.getDate() + predictedDays);

    let supplierExpiry = expiryDate ? new Date(expiryDate) : null;
    let capped = false;
    if (supplierExpiry && predExpiry > supplierExpiry) {
      predExpiry = supplierExpiry;
      capped = true;
    }

    res.json({
      cropType,
      amountKg,
      warehouseSizeSqm,
      city,
      temperature,
      humidity,
      insulation,
      refrigeration,
      baseRemainingDays,
      predictedShelfLifeDays: predictedDays,
      predictedExpiryDate: predExpiry.toISOString().split('T')[0],
      supplierExpiryDate: supplierExpiry ? supplierExpiry.toISOString().split('T')[0] : null,
      cappedBySupplier: capped
    });
  } catch (err) {
    console.error('ML Prediction error:', err.response?.data || err.message);
    res.status(500).json({ error: 'ML prediction failed', details: err.message });
  }
});

// --- Optional: test/sanity route for debugging ---
router.get('/mlpredict-test', (req, res) => {
  res.json({ message: "Test route is working." });
});

// Always only ONE export!
module.exports = router;
