const express = require('express');
const router = express.Router();
const {
  getLabRequests,
  getLabRequestDetails,
  updateLabResults,
  getCurrentLabTechnicianAccount
} = require('../controllers/labRequestController');
const authMiddleware = require("../middleware/authmiddleware");

// Protected routes
router.get('/requests', authMiddleware, getLabRequests);
router.get('/requests/:id', authMiddleware, getLabRequestDetails);
router.put('/requests/:id', authMiddleware, updateLabResults);
router.get('/account/current', authMiddleware, getCurrentLabTechnicianAccount);

module.exports = router;