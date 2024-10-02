const mongoose = require('mongoose');

const detailsSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  imageUrl: { type: String, required: true }, // Store the uploaded image URL
  extractedInfo: {
    name: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: Date, required: true }
  },
   // New field for validity
});

const Details = mongoose.model('Details', detailsSchema);
module.exports = Details;