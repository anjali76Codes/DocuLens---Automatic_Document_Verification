const mongoose = require('mongoose');

const AadharCardSchema = new mongoose.Schema({
    filePath: {
        type: String,
        required: true,
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
    isAadharVerified: {
        type: Boolean,
        default: false, // Initially set to false
    },
    name: {
        type: String,
        required: true,
    },
    dob: {
        type: Date,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('AadharCard', AadharCardSchema);
