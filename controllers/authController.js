const bcrypt = require("bcrypt");
const User = require("../models/user");
const generateToken = require("../lib/utils");

const dotevn = require("dotenv");
dotevn.config();



 

const login = async (req, res) => {
  console.log("Login request received:", req.body);
  
  
  try {
    const { email, password, role } = req.body;
 
    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        msg: "Please provide email, password, and role",
      });
    }

    const user = await User.findOne({ email });
  

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found. Please check your email or register.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        msg: "Invalid password. Please try again.",
      });
    }

    if (user.role !== role) {
      return res.status(403).json({
        success: false,
        msg: `Access denied. This account is not registered as a ${role}.`,
      });
    }

    hospitalID = process.env.HOSPITAL_ID;

    generateToken(user._id, hospitalID, user.role, res);

    res.status(200).json({
      success: true,
      userId: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      role: user.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      msg: "Internal server error. Please try again later.",
    });
  }
};


// authenticate
const jwt = require("jsonwebtoken");

const auth = (req, res) => {
  const token = req.cookies.jwt;
   if (!token) return res.status(401).json({ msg: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
     res.status(200).json(
      decoded
    );
     
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};


 
const logout = (req, res) => {
  // Clear the JWT cookie
  console.log("fffffffffffffffffff");
  
res.clearCookie("jwt", {
  httpOnly: true,
  sameSite: "strict",
  secure: true,
  path: "/", // include path if not otherwise scoped
});

  res.status(200).json({ message: "Logged out successfully" });
};


module.exports = { login,auth ,logout};
