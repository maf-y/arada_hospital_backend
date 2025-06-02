const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const labRequestSchema = new Schema({
  patientID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  doctorID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  testType: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending",
  },
  requestDate: { type: Date, default: Date.now },
  completionDate: { type: Date },
  labTechnicianID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LabTechnician",
  },
  results: {
    testValue: { type: String },
    normalRange: { type: String },
    interpretation: { type: String },
    notes: { type: String },
    attachment: { type: String }, // URL to uploaded file if needed
    completedDate: { type: Date }
  }
});

const LabRequest = mongoose.model("LabRequest", labRequestSchema);
module.exports = LabRequest;