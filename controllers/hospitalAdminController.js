const User = require("../models/user");
const Doctor = require("../models/doctor");
const LabTechnician = require("../models/LabTechnician");
const Pharmacist = require("../models/pharmacist");
const Receptionist = require("../models/receptionist");
const Triage = require("../models/triage");
const Patient = require("../models/patient");
const mongoose = require("mongoose")
const bcrypt = require("bcrypt");
const HospitalAdministrator = require("../models/HospitalAdministrator");
const addStaffAccount = async (req, res) => {
  try {
    const {
      role,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      password,
      email,
      contactNumber,
      address,
      
    } = req.body;

    const { role: staffRole } = req.user;

    if (!staffRole || staffRole !== "HospitalAdministrator") {
      return res
        .status(400)
        .json({ message: "Only hospital admins can add staff member" });
    }

    if (!role) {
      return res.status(400).json({ message: "Role is required." });
    }

    const lowerCaseRole = role.toLowerCase();

    const RoleModels = {
      doctor: Doctor,
      labtechnician: LabTechnician,
      pharmacist: Pharmacist,
      receptionist: Receptionist,
      triage: Triage,
    };

    if (!RoleModels[lowerCaseRole]) {
      return res.status(400).json({ message: "Invalid role provided." });
    }

    const existingStaff = await User.findOne({email:email})
    if (existingStaff) {
      return res.status(400).json({ message: "Staff Already Exist." });
    }
    // 🔐 Hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const StaffModel = RoleModels[lowerCaseRole];
    const staff = new StaffModel({
      firstName,
      lastName,
      dateOfBirth,
      gender,
      password: hashedPassword, 
      contactNumber,
      address,
      role,
      email,
    });

    await staff.save();

    res
      .status(201)
      .json({ message: "Staff account created successfully", staff });
  } catch (error) {
    console.error("Error in addStaffAccount:", error);
    res
      .status(500)
      .json({ message: "Error creating staff account", error: error.message });
  }
};


const getStaff = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Find the user with populated hospital data
    const user = await User.findById(id)
      

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // For Hospital Administrators, get additional hospital info
  
    if (user.role === 'HospitalAdministrator') {
      const admin = await HospitalAdministrator.findById(id)
        
      
    }

    // Structure the response data
    const responseData = {
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        role: user.role,
        contactNumber: user.contactNumber,
        address: user.address,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
     
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error in getStaffDetails:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getHospitalDetails = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "HospitalAdministrator") {
      return res.status(403).json({ msg: "Unauthorized access" });
    }   
    // Get all staff for this hospital (excluding system Admins)
    const staff = await User.aggregate([
      {
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          role: 1,
          lastLogin: 1,
          status: 1,
          createdAt: 1,
          dateOfBirth: 1,
          gender: 1,
          profilePicture: 1
        }
      },
      { $sort: { role: 1, createdAt: -1 } }
    ]);

    // Categorize staff by their roles
    const staffByRole = staff.reduce((acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = [];
      }
      acc[user.role].push(user);
      return acc;
    }, {});

    // Get counts for each role
    const roleCounts = Object.keys(staffByRole).reduce((acc, role) => {
      acc[role] = staffByRole[role].length;
      return acc;
    }, {});

    res.status(200).json({
      
      staff,
      staffByRole,
      roleCounts,
      totalStaff: staff.length
    });

  } catch (error) {
    console.error("Get hospital details error:", error);
    res.status(500).json({ msg: "Server error fetching hospital details" });
  }
}


const getStaffAccounts = async (req, res) => {
  try {
    
    const staffs = await User.find();

    res.status(200).json(  staffs );
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something Went Wrong"});
  }
};
const getStaffAccount = async (req, res) => {
  try {
    const {id}= req.params

    const staffs = await User.findById(id);

    res.status(200).json(  staffs );
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something Went Wrong"});
  }
};


const deleteStaffAccount = async (req, res) => {
  try {
    const { role: staffRole } = req.user;

    if (!staffRole || staffRole != "HospitalAdministrator") {
      return res
        .status(400)
        .json({ message: "Only hospital admins can add staff member" });
    }

    const { staffId } = req.params;
    const deletedUser = await User.findByIdAndDelete(staffId);

    if (!deletedUser) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.status(200).json({ message: "Staff deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting staff", error: error.message });
  }
};

const viewPatientsByHospital = async (req, res) => {
  try {
    const { role: staffRole } = req.user;

    if (!staffRole || staffRole != "HospitalAdministrator") {
      return res
        .status(400)
        .json({ message: "Only hospital admins can add staff member" });
    }

    
    const patients = await Patient.find();

    if (!patients.length) {
      return res
        .status(404)
        .json({ message: "No patients found for this hospital" });
    }

    res.status(200).json({ patients });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching patients", error: error.message });
  }
};

module.exports = {
  addStaffAccount,
  getStaffAccounts,
  deleteStaffAccount,
  viewPatientsByHospital,
  getStaffAccount,
  getHospitalDetails,
  getStaff
};
