const User = require('./user');
const mongoose = require('mongoose');

const pharmacistSchema = new mongoose.Schema({
    
    contactNumber: { type: String, required: true },
    address: { type: String, required: true }
});

const Pharmacist = User.discriminator('Pharmacist', pharmacistSchema);
module.exports = Pharmacist;