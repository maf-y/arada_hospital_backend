const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user");

const emergencyContactSchema = new Schema({
  name: { type: String, required: true },
  relation: { 
    type: String, 
    required: true,
    enum: ["Parent", "Spouse", "Sibling", "Child", "Relative", "Friend", "Other"]
  },
  phone: { type: String, required: true }
}, { _id: false });

const patientSchema = new Schema({
  // Patient-specific fields
  faydaID: { 
    type: String, 
    required: true, 
    unique: true
  },
  contactNumber: { 
    type: String, 
    required: true
  },
  address: { 
    type: String, 
    required: true
  },
  emergencyContact: { 
    type: emergencyContactSchema, 
    required: true 
  },
  medicalHistory: { 
    type: String
  },

  assignedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor"
  },
  status: {
    type: String,
    enum: ["Active", "Inactive","In-Treatment","InTreatment", "Discharged", "Emergency"],
    default: "Active"
  },
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", null],
    default: null
  },
  // Manually handle timestamps since we can't use the option
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Removed timestamps: true since it's not allowed in discriminators
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtuals
patientSchema.virtual("fullName").get(function() {
  return `${this.firstName} ${this.lastName}`;
});

patientSchema.virtual("age").get(function() {
  if (!this.dateOfBirth) return null;
  const diff = Date.now() - this.dateOfBirth.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});

// Update timestamp before saving
patientSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create the Patient model by discriminating against the User model
const Patient = User.discriminator("Patient", patientSchema);
module.exports = Patient;