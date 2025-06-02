const LabRequest = require('../models/LabRequest');
const LabTechnician = require('../models/LabTechnician');
const Patient = require('../models/patient');

// Get all lab requests for the technician's hospital
const getLabRequests = async (req, res) => {
  try {
   

    

    let labRequests = await LabRequest.find()
      .populate({
        path: 'patientID',
        select: 'faydaID firstName lastName gender dateOfBirth',
        match: req.query.search ? { 
          $or: [
            { firstName: { $regex: req.query.search, $options: 'i' } },
            { lastName: { $regex: req.query.search, $options: 'i' } },
            { faydaID: { $regex: req.query.search, $options: 'i' } }
          ]
        } : {}
      })
      .populate('doctorID', 'firstName lastName')
      .sort({ requestDate: -1 });

    // Filter out requests where patient is null (due to search)
    if (req.query.search) {
      labRequests = labRequests.filter(request => request.patientID !== null);
    }

    res.status(200).json(labRequests);
  } catch (error) {
    console.error("Error fetching lab requests:", error);
    res.status(500).json({ message: "Error fetching lab requests", error: error.message });
  }
};

// Get single lab request details
const getLabRequestDetails = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    
    const labRequest = await LabRequest.findById(id)
      .populate('patientID', 'faydaID firstName lastName gender dateOfBirth bloodGroup')
      .populate('doctorID', 'firstName lastName specialization')
      .populate('labTechnicianID', 'firstName lastName');

    if (!labRequest) {
      return res.status(404).json({ message: "Lab request not found" });
    }

    res.status(200).json(labRequest);
  } catch (error) {
    console.error("Error fetching lab request details:", error);
    res.status(500).json({ message: "Error fetching lab request details", error: error.message });
  }
};

// Update lab request results
const updateLabResults = async (req, res) => {
  try {
    const { id } = req.params;
    const { testValue, normalRange, interpretation, notes, status } = req.body;
    const labTechnicianID = req.user._id;

    const updateData = {
      status,
      labTechnicianID,
      'results.testValue': testValue,
      'results.normalRange': normalRange,
      'results.interpretation': interpretation,
      'results.notes': notes,
      'results.completedDate': status === 'Completed' ? new Date() : undefined
    };

    if (status === 'Completed') {
      updateData.completionDate = new Date();
    }

    const updatedRequest = await LabRequest.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('patientID', 'faydaID firstName lastName');

    if (!updatedRequest) {
      return res.status(404).json({ message: "Lab request not found" });
    }

    res.status(200).json({
      message: "Lab results updated successfully",
      labRequest: updatedRequest
    });
  } catch (error) {
    console.error("Error updating lab results:", error);
    res.status(500).json({ message: "Error updating lab results", error: error.message });
  }
};

// Get current lab technician account details
const getCurrentLabTechnicianAccount = async (req, res) => {
  try {
    const technician = await LabTechnician.findById(req.user._id)
      

    if (!technician) {
      return res.status(404).json({ message: "Lab technician not found" });
    }
    const hospitalID = process.env.HOSPITAL_ID

    res.status(200).json({
      _id: technician._id,
      email: technician.email,
      firstName: technician.firstName,
      lastName: technician.lastName,
      dateOfBirth: technician.dateOfBirth,
      gender: technician.gender,
      role: technician.role,
      contactNumber: technician.contactNumber,
      address: technician.address,

      createdAt: technician.createdAt,
      updatedAt: technician.updatedAt
    });
  } catch (error) {
    console.error("Error in getCurrentLabTechnicianAccount:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getLabRequests,
  getLabRequestDetails,
  updateLabResults,
  getCurrentLabTechnicianAccount
};