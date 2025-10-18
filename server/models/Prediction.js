// models/Prediction.js
const mongoose = require('mongoose');
const PredictionSchema = new mongoose.Schema({
  cropType: String,
  amountKg: Number,
  warehouseSizeSqm: Number,
  city: String,
  manufactureDate: Date,
  expiryDate: Date,
  temperature: Number,
  humidity: Number,
  predictionResult: Object, // put result from backend
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Prediction', PredictionSchema);
