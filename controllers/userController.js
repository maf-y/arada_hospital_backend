const bcrypt = require("bcrypt");
const Patient = require("../models/patient"); 
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/prescription');
const Doctor = require('../models/doctor');

const registerPatient = async (req, res) => {
  try {
    const {
      faydaID,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      email,
      password,
      contactNumber,
      address,
      emergencyContact,
      medicalHistory
    } = req.body;

    // Basic required field check
    if (
      !faydaID ||
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !gender ||
      !password ||
      !email ||

      !contactNumber ||
      !address ||
      !emergencyContact?.name ||
      !emergencyContact?.relation ||
      !emergencyContact?.phone
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    const existingPatient = await Patient.findOne({ faydaID });

    if (existingPatient) {
      return res.status(200).json({
        success: true,
        message: "Patient already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newPatient = await Patient.create({
      faydaID,
      firstName,
      lastName,
      dateOfBirth: new Date(dateOfBirth),
      gender,
      email,
      password: hashedPassword,
      contactNumber,
      address,
      emergencyContact,
      medicalHistory: medicalHistory || "",
      status: "Active"
    });

    return res.status(201).json({
      success: true,
      message: "New patient registered",
      patient: {
        _id: newPatient._id,
        faydaID: newPatient.faydaID,
        firstName: newPatient.firstName,
        lastName: newPatient.lastName,
        contactNumber: newPatient.contactNumber,
        gender: newPatient.gender,
        status: newPatient.status,
        role: newPatient.role,
        emergencyContact: newPatient.emergencyContact
      }
    });

  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Fayda ID already exists"
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};



// Get patient's medical records
const getMedicalRecords = async (req, res) => {
  
  try {
    const patientId = req.params.patientId;
    
    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get medical records for the patient
    const medicalRecords = await MedicalRecord.find({ patientID: patientId })
      .populate('currentDoctor', 'firstName lastName specialization')
      .populate('triageData.staffID', 'firstName lastName');

      console.log(medicalRecords);
    res.status(200).json(medicalRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get patient's prescriptions
const getPrescriptions = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    
    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get prescriptions for the patient
    const prescriptions = await Prescription.find({ patientID: patientId })
      .populate('doctorID', 'firstName lastName specialization');

    res.status(200).json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get patient's assigned doctor
const getAssignedDoctor = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    
    // Get patient with assigned doctor details
    const patient = await Patient.findById(patientId)
      .populate('assignedDoctor', 'firstName lastName specialization contactNumber');

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    if (!patient.assignedDoctor) {
      return res.status(404).json({ message: 'No doctor assigned to this patient' });
    }

    res.status(200).json(patient.assignedDoctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Submit a review for the doctor
const submitDoctorReview = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const { doctorId, rating, comment } = req.body;

    // Validate input
    if (!doctorId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if patient is assigned to this doctor
    if (patient.assignedDoctor.toString() !== doctorId) {
      return res.status(403).json({ message: 'Patient is not assigned to this doctor' });
    }

    // Create new review
    const newReview = {
      patientID: patientId,
      rating,
      comment: comment || ''
    };

    // Add review to doctor's reviews array
    doctor.reviews.push(newReview);
    await doctor.save();

    console.log("🚀 ~ submitDoctorReview ~ newReview:", newReview)
    res.status(201).json({ message: 'Review submitted successfully', review: newReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get patient details
const getPatientDetails = async (req, res) => {
  try {
    console.log("🚀 ~ getPatientDetails ~ req.params:", req.params)
    const patientId = req.params.patientId;
    
    const patient = await Patient.findById(patientId)
      .select('-password') // Exclude sensitive data
      .populate('assignedDoctor', 'firstName lastName specialization');

      console.log("🚀 ~ getPatientDetails ~ patient:", patient)
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    console.log("🚀 ~ getPatientDetails ~ patient:", patient)
    console.log(patient)
    res.status(200).json(patient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};




module.exports = {
  registerPatient,
  getAssignedDoctor,
  submitDoctorReview,
  getMedicalRecords,
  getPrescriptions,
  getPatientDetails
};

