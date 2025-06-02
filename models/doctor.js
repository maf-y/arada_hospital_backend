const User = require('./user');
const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    contactNumber: { type: String, required: true },
    address: { type: String, required: true },
    specialization: { type: String },
    assignedPatientID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient'}],
    reviews: [{
        patientID: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String }
    }],
});

const Doctor = User.discriminator('Doctor', doctorSchema);
module.exports = Doctor;