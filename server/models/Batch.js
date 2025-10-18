const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropName: { type: String, required: true },
  batchNumber: { type: String, required: true },
  harvestDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  shelfLife: { type: Number, required: true },
  quantityAvailable: { type: Number, required: true },
  warehouseLocation: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now }  // Added field to support updates
}, { timestamps: true });

module.exports = mongoose.models.Batch || mongoose.model('Batch', batchSchema);
