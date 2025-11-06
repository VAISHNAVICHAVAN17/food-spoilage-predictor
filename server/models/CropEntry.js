// models/CropEntry.js
const mongoose = require('mongoose');

const cropEntrySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  cropName: { type: String, required: true },
  cropStage: { type: String, required: true },
  soilType: { type: String, required: true },
  pesticideUsed: String,
  irrigationType: String,
  fertilizerUsed: String,
  currentIssues: String,
  
  // ✅ ADD THESE CRITICAL FIELDS
  durationDays: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true  // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('CropEntry', cropEntrySchema);
