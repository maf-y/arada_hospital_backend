const express = require('express')
const router = express.Router()
const triageController = require('../controllers/triageController')
const authMiddleware = require('../middleware/authmiddleware')

// Dashboard stats
router.get('/stats', authMiddleware, triageController.getTriageStats)

// Unassigned patients
router.get('/unassigned', authMiddleware, triageController.getUnassignedPatients)

// Get doctors
router.get('/doctors', authMiddleware, triageController.getDoctorsForAssignment)

// Get patient details
router.get('/patients/:id', authMiddleware, triageController.getPatientDetails)

// Process triage
router.post('/process', authMiddleware, triageController.processTriage)

module.exports = router