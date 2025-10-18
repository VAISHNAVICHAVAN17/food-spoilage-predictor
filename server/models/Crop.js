const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  cropName: { type: String, required: true },
  batchNumber: { type: String, required: true, unique: true },
  harvestDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  shelfLife: { type: Number, required: true },
  quantityAvailable: { type: Number, required: true },
  warehouseLocation: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Batch', batchSchema);
