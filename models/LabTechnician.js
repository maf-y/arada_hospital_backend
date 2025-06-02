const User = require('./user');
const mongoose = require('mongoose');

const labTechnicianSchema = new mongoose.Schema({
    
    contactNumber: { type: String, required: true },
    address: { type: String, required: true }
});

const LabTechnician = User.discriminator('LabTechnician', labTechnicianSchema);
module.exports = LabTechnician;