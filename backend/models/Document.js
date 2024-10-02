const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  documentType: { type: String, required: true },
  url: { type: String, required: true },
  status: { type: String, default: 'pending' }, // pending, approved, rejected
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Document', DocumentSchema);
