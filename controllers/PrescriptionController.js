const Prescription = require('../models/prescription');
// Fetch prescriptions based on patient or doctor
const getPrescriptions = async (req, res) => {
    try {
        const { patientID, doctorID } = req.query; // Query params for filtering by patient or doctor

        let query = {};
        if (patientID) query.patientID = patientID;
        if (doctorID) query.doctorID = doctorID;

        const prescriptions = await Prescription.find(query).populate('patientID doctorID');

        if (prescriptions.length === 0) {
            return res.status(404).json({ message: 'No prescriptions found.' });
        }

        res.status(200).json(prescriptions);
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        res.status(500).json({ message: 'Error fetching prescriptions', error: error.message });
    }
};

// Print out the prescription details
const printPrescription = async (req, res) => {
    try {
        const { prescriptionId } = req.params;

        const prescription = await Prescription.findById(prescriptionId).populate('patientID doctorID');

        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        const prescriptionDetails = {
            patient: `${prescription.patientID.firstName} ${prescription.patientID.lastName}`,
            doctor: `${prescription.doctorID.firstName} ${prescription.doctorID.lastName}`,
            datePrescribed: prescription.datePrescribed,
            medicineList: prescription.medicineList.map((medicine, index) => {
                return `${index + 1}. ${medicine.name} - ${medicine.dosage}, ${medicine.frequency}, for ${medicine.duration}`;
            }),
            status: prescription.isFilled ? 'Filled' : 'Not Filled',
        };

        res.status(200).json({ message: 'Prescription details', prescriptionDetails });
    } catch (error) {
        console.error('Error printing prescription:', error);
        res.status(500).json({ message: 'Error printing prescription', error: error.message });
    }
};

module.exports = { getPrescriptions, printPrescription };
