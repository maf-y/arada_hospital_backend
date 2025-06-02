const express = require("express");
const router = express.Router();

// Controller
const {registerPatient,
    getAssignedDoctor,
    submitDoctorReview,
    getMedicalRecords,
    getPrescriptions,
    getPatientDetails,} = require("../controllers/userController"); // adjust path if needed

const { userAuthMiddleware } = require('../middleware/userAuthMiddleware');

// Register a new patient
router.post("/register-user", registerPatient);



//router.use(userAuthMiddleware);

// Get patient details
router.get('/:patientId', getPatientDetails);

// Get patient's medical records
router.get('/:patientId/medical-records', getMedicalRecords);

// Get patient's prescriptions
router.get('/:patientId/prescriptions', getPrescriptions);

// Get patient's assigned doctor
router.get('/:patientId/doctor', getAssignedDoctor);

// Submit a review for the doctor
router.post('/:patientId/reviews', submitDoctorReview);

module.exports = router;

