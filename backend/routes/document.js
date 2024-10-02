const express = require('express');
const multer = require('multer');
const Document = require('../models/Document');
const path = require('path');

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Upload Document
router.post('/upload', upload.single('file'), async (req, res) => {
  const { userId, documentType } = req.body;
  const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;

  const newDocument = new Document({
    userId,
    documentType,
    url: fileUrl,
  });

  await newDocument.save();
  res.status(201).json({ message: 'Document uploaded successfully', document: newDocument });
});

// Get Documents for Admin Review
router.get('/', async (req, res) => {
  const documents = await Document.find();
  res.json(documents);
});

// Approve Document
router.put('/approve/:id', async (req, res) => {
  const document = await Document.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
  res.json(document);
});

// Reject Document
router.put('/reject/:id', async (req, res) => {
  const document = await Document.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
  res.json(document);
});

module.exports = router;
