const express = require('express');
const { getPrescriptions, printPrescription } = require('../controllers/PrescriptionController');
const router = express.Router();



router.get('/', getPrescriptions);


router.get('/:prescriptionId/print', printPrescription);


module.exports = router;