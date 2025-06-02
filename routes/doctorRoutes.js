const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/DoctorController');
const authMiddleware = require("../middleware/authmiddleware");

// Doctor profile routes
router.get('/getStaffAccount/:id', authMiddleware, doctorController.getStaffAccount);

// Patient management routes
router.get('/patients', authMiddleware, doctorController.getAssignedPatients);
router.get('/patients/:patientId/profile', authMiddleware, doctorController.getPatientProfile);

// Medical record routes
router.get('/patients/:patientId/records', authMiddleware, doctorController.getPatientMedicalHistory);
router.patch('/records/:recordId/start-treatment', authMiddleware, doctorController.startTreatment);
router.get('/records/:recordId', authMiddleware, doctorController.getMedicalRecord);
router.put('/records/:recordId', authMiddleware, doctorController.updateMedicalRecord);

// Lab request routes
router.post('/records/:recordId/lab-requests', authMiddleware, doctorController.createLabRequest);
router.get('/records/:recordId/lab-requests', authMiddleware, doctorController.getPatientLabRequests);

// Prescription routes
router.post('/records/:recordId/prescriptions', authMiddleware, doctorController.createPrescription);
router.get('/records/:recordId/prescriptions', authMiddleware, doctorController.getPatientPrescriptions);

module.exports = router;