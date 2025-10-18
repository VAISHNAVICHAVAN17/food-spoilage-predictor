const mongoose = require('mongoose');

const importExportSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  type: { type: String, enum: ['import', 'export'], required: true },
  quantity: { type: Number, required: true },
  movementDate: { type: Date, required: true },
  party: { type: String, default: "" },
  status: { type: String, default: 'completed' }
});

module.exports = mongoose.models.ImportExport || mongoose.model('ImportExport', importExportSchema);
