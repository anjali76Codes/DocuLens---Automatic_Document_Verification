// backend/index.js
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer'); // For file uploads
const { exec } = require('child_process');
const path = require('path');
const userRoutes = require('./routes/user.route')

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 5000;

// CORS middleware to allow communication between frontend and backend
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your React frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use('/api', userRoutes)
;

// Set up multer to store uploaded images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // Save uploaded files to the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Unique filename with a timestamp
    }
});
const upload = multer({ storage });

// Ensure 'uploads' directory exists, create it if it doesn't
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Endpoint to handle image uploads and perform OCR
app.post('/extract-text', upload.single('image'), (req, res) => {
    const imagePath = path.join(__dirname, 'uploads', req.file.filename); // Path to the uploaded image

    // Run the Python script with the image path as an argument
    const pythonCommand = `python extract_text.py "${imagePath}"`;

    exec(pythonCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).send('Error extracting text');
        }
        if (stderr) {
            console.error(`Error: ${stderr}`);
            return res.status(500).send('Error extracting text');
        }

        // Send the extracted text back to the frontend
        res.json({ text: stdout.trim() });
    });
});

// MongoDB connection (optional)
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});



