const express = require('express');
const { createDetails, getDetails, getAllApplicants, getDetailsByFullName, validateDetailsByFullName } = require('../controllers/detailsController');

const router = express.Router();

router.post('/details', createDetails); // Create new details
router.get('/details', getDetails); // Get all details

// Route to get all applicants
router.get('/applicants', getAllApplicants);

// Route to get details by fullName
router.get('/details/fullname/:fullName', getDetailsByFullName); // Add this line

// Route to validate details by fullName
router.put('/details/validate', validateDetailsByFullName); // Add this line

module.exports = router;