const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const medicalRecordSchema = new Schema({
  faydaID: { type: String, required: true, index: true },
  patientID: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
 
  currentDoctor: { type: Schema.Types.ObjectId, ref: 'Doctor' },
  status: {
    type: String,
    enum: ["Unassigned", "Assigned", "InTreatment", "Completed"],
    default: "Unassigned"
  },
  triageData: {
    vitals: {
      bloodPressure: String,
      heartRate: Number,
      temperature: Number,
      oxygenSaturation: Number
    },
    chiefComplaint: String,
    urgency: {
      type: String,
      enum: ["Low", "Medium", "High", "Emergency"],
      default: "Medium"
    },
    staffID: { type: Schema.Types.ObjectId, ref: 'Triage' },
    completedAt: Date
  },
  doctorNotes: {
    diagnosis: String,
    treatmentPlan: String,
    prescriptions: [{ type: Schema.Types.ObjectId, ref: 'Prescription' }]
  },
  labRequests: [{
    type: Schema.Types.ObjectId,
    ref: 'LabRequest'
  }]
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);