const User = require('./user');
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({});

const Admin = User.discriminator('Admin', adminSchema);
module.exports = Admin;