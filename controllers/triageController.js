const Patient = require('../models/patient')
const MedicalRecord = require('../models/MedicalRecord')
const Doctor = require('../models/doctor')
const Triage = require('../models/triage')

// Get triage dashboard stats
exports.getTriageStats = async (req, res) => {
  try {
   
    
    const [unassigned, doctors, inTreatment] = await Promise.all([
      MedicalRecord.countDocuments({ 
      
        status: "Unassigned" 
      }),
      Doctor.countDocuments({ 
       
        status: "active" 
      }),
      Patient.countDocuments({ 
        
        status: "InTreatment" 
      })
    ])

    res.status(200).json({
      success: true,
      unassigned,
      doctors,
      inTreatment
    })
  } catch (error) {
    console.error('Error fetching triage stats:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// Get unassigned patients with search
exports.getUnassignedPatients = async (req, res) => {
  try {
    

    
    const { page = 1, limit = 10, search = '' } = req.query

    const query = {
      
      status: "Unassigned"
    }

    if (search) {
      const patients = await Patient.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { faydaID: { $regex: search, $options: 'i' } }
        ]
      }).select('_id')

      query.patientID = { $in: patients.map(p => p._id) }
    }

    const [records, total] = await Promise.all([
      MedicalRecord.find(query)
        .populate('patientID', 'firstName lastName faydaID gender dateOfBirth contactNumber')
        .skip((page - 1) * limit)
        .limit(limit),
      MedicalRecord.countDocuments(query)
    ])

    res.status(200).json({
      success: true,
      patients: records,
      total,
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching unassigned patients:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// Get doctors for assignment
exports.getDoctorsForAssignment = async (req, res) => {
  try {
   
    const { search = '' } = req.query

    const query = {
     
      
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ]
    }

    const doctors = await Doctor.find(query)
      .select('firstName lastName specialization')

    res.status(200).json({
      success: true,
      doctors
    })
  } catch (error) {
    console.error('Error fetching doctors:', error)
    res.status(500).json({
      success: false,
      message: 'Server error'
    })
  }
}

// Process triage and assign doctor


// Process triage and assign doctor
exports.processTriage = async (req, res) => {
  try {
    const { recordId, vitals, diagnosis, urgency, doctorId } = req.body;
  const triageStaffId = req.user._id
    


    // 1. Verify record exists and is unassigned
    const record = await MedicalRecord.findOne({
      _id: recordId,
      status: "Unassigned"
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found or already assigned"
      });
    }

    // 2. Verify doctor exists
    const doctor = await Doctor.findOne({
      _id: doctorId,
      
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    // 3. Update medical record
    record.status = "Assigned";
    record.currentDoctor = doctorId;
    record.triageData = {
      vitals: vitals,
      urgency: urgency,
      staffID: triageStaffId,
      completedAt: new Date()
    };
    record.doctorNotes = {
      diagnosis: diagnosis,
      treatmentPlan: "",
      prescriptions: []
    };
    
    await record.save();

    // 4. Update patient
    const patient = await Patient.findById(record.patientID);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      });
    }
    
    patient.assignedDoctor = doctorId;
    patient.status = "InTreatment";
    await patient.save();

    // 5. Update doctor
    doctor.assignedPatientID.addToSet(record.patientID);
    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Patient assigned successfully",
      data: {
        recordId: record._id,
        status: "Assigned",
        doctor: {
          id: doctor._id,
          name: `${doctor.firstName} ${doctor.lastName}`
        }
      }
    });

  } catch (error) {
    console.error("Triage error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process triage",
      error: error.message
    });
  }
};












// Get patient details for processing
exports.getPatientDetails = async (req, res) => {
  try {
    const { id } = req.params
    

    const record = await MedicalRecord.findOne({
      _id: id,
   
    })
    .populate('patientID', 'firstName lastName faydaID gender dateOfBirth contactNumber emergencyContact bloodGroup allergies')

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found"
      })
    }

    res.status(200).json({
      success: true,
      data: {
        ...record.patientID.toObject(),
        recordId: record._id,
        registeredAt: record.createdAt
      }
    })
  } catch (error) {
    console.error("Error fetching patient details:", error)
    res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}