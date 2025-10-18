const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userType: {
    type: String,
    enum: ['farmer', 'warehouse'],
    required: true,
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },

  region: { type: String },
  farmSize: { type: Number },
  farmType: { type: String, enum: ['crop', 'livestock', 'mixed'] },
  crops: { type: String },

  warehouseName: { type: String },
  location: { type: String },
  capacity: { type: Number },

  acceptTerms: { type: Boolean, required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
