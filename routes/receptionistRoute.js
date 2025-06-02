const express = require("express");
const { 
  registerOrInitiatePatient,
  searchPatients,
  getPatientByFaydaID,
  getReceptionistAccount
} = require("../controllers/receptionistController");
const authMiddleware = require("../middleware/authmiddleware");

const router = express.Router();

router.post("/register-patient", authMiddleware, registerOrInitiatePatient);
router.get("/search-patients", authMiddleware, searchPatients);
router.get("/patient/:faydaID", authMiddleware, getPatientByFaydaID);
router.get('/getStaffAccount/:id', getReceptionistAccount);
module.exports = router;