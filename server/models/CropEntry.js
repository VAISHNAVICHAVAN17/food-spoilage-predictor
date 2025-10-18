// models/CropEntry.js
const mongoose = require('mongoose');

const cropEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cropName: String,
  cropStage: String,
  soilType: String,
  pesticideUsed: String,
  irrigationType: String,
  fertilizerUsed: String,
  currentIssues: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CropEntry', cropEntrySchema);
