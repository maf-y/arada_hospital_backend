const express = require("express");
const router = express.Router();
const {
  addStaffAccount,
  getStaffAccounts,
  deleteStaffAccount,
  viewPatientsByHospital,
  getHospitalDetails,
  getStaff,
} = require("../controllers/hospitalAdminController");
const authMiddleware = require("../middleware/authmiddleware");

router.get("/staff", authMiddleware, getStaffAccounts);
router.get("/getStaffAccount/:id", authMiddleware, getStaff);
router.get("/hospitals/:id", authMiddleware, getHospitalDetails
);
router.post("/add-staff", authMiddleware, addStaffAccount);
router.delete("/staff/:staffId", authMiddleware, deleteStaffAccount);

router.get("/patients", authMiddleware, viewPatientsByHospital);

module.exports = router;
