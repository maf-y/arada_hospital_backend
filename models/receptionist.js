const User = require('./user');
const mongoose = require('mongoose');

const receptionistSchema = new mongoose.Schema({
    
    contactNumber: { type: String, required: true },
    address: { type: String, required: true }
});

const Receptionist = User.discriminator('Receptionist', receptionistSchema);
module.exports = Receptionist;