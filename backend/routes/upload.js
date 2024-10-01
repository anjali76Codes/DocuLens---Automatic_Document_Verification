const express = require('express');
const multer = require('multer');
const path = require('path');
const AadharCard = require('../models/AadharCard');
const Tesseract = require('tesseract.js');
const router = express.Router();

// Set up storage for multer'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage });

// Function to extract Aadhar details
const extractAadharDetails = async (filePath) => {
    const result = await Tesseract.recognize(
        filePath,
        'eng',
        {
            logger: (m) => console.log(m) // Optional logger
        }
    );
    return result.data.text; // Return the recognized text
};

// Upload route
router.post('/', upload.single('aadharCard'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const extractedText = await extractAadharDetails(req.file.path);
        console.log('Extracted Text:', extractedText); // Debugging line

        const name = extractName(extractedText);
        const dob = extractDOB(extractedText);
        const gender = extractGender(extractedText);

        if (!name || !dob || !gender) {
            return res.status(400).send('Aadhar card verification failed. Details could not be extracted.');
        }

        // Create new AadharCard entry
        const newAadharCard = new AadharCard({
            filePath: req.file.path,
            isAadharVerified: true,
            name: name,
            dob: dob,
            gender: gender,
        });

        await newAadharCard.save();
        
        // Send back the extracted data
        res.status(201).json({
            message: 'Aadhar card uploaded and verified successfully!',
            data: {
                name: name,
                dob: dob,
                gender: gender,
            }
        });
    } catch (error) {
        console.error('OCR Error:', error); // Debugging line
        res.status(500).send('Error processing Aadhar card: ' + error.message);
    }
});


// Functions to extract Name, DOB, and Gender from text
const extractName = (text) => {
    const nameRegex = /Name:\s*(.+)/i; // Adjust regex based on expected format
    const match = text.match(nameRegex);
    return match ? match[1].trim() : null;
};

const extractDOB = (text) => {
    const dobRegex = /DOB:\s*(\d{2}\/\d{2}\/\d{4})/; // Adjust regex based on expected format
    const match = text.match(dobRegex);
    return match ? new Date(match[1]) : null;
};

const extractGender = (text) => {
    const genderRegex = /Gender:\s*(.+)/i; // Adjust regex based on expected format
    const match = text.match(genderRegex);
    return match ? match[1].trim() : null;
};

module.exports = router;
