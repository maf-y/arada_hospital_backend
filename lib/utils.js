const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();



const generateToken = (userId,hospitalID, role, res) => {
  // Store hospitalId as a constant Mongoose ObjectId
   hospitalId = new mongoose.Types.ObjectId(hospitalID);

  const token = jwt.sign({ userId, hospitalId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", 
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};

module.exports = generateToken;
