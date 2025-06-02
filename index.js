const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const hospitalAdminRoutes = require("./routes/hospitalAdminRoutes");
const triageRoutes = require("./routes/triageRoutes");
const labRoutes = require("./routes/labReqeustRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const receptionistRoutes = require("./routes/receptionistRoute");
const doctorRoutes = require( "./routes/doctorRoutes");
const userRoutes = require( "./routes/userRoute");
const authRoute = require("./routes/authRoute");

const connectDB = require("./lib/db");
const Admin = require("./models/admin");

dotenv.config();
const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173","http://localhost:5174","https://arardahospital-frontend.onrender.com"], // Your frontend origin
    credentials: true, // Allow credentials (cookies, authorization headers)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());

app.use("/api/hospital-admin", hospitalAdminRoutes);
app.use("/api/reception", receptionistRoutes);
app.use("/api/triage", triageRoutes);
app.use("/api/lab", labRoutes);
app.use("/api/prescription", prescriptionRoutes);
app.use("/api/auth", authRoute);
app.use("/api/doctors", doctorRoutes);
app.use("/api/user", userRoutes);


app.post("/api/admin", async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      password,
    } = req.body;

    const existingAdmin = await Admin.findOne({ email, role: "Admin" });
    if (existingAdmin) {
      return res.status(409).json({ msg: "Admin with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      email,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      password: hashedPassword,
      role: "Admin",
    });

    const savedAdmin = await newAdmin.save();
    res.status(201).json({ msg: "Admin registered successfully", admin: savedAdmin });
  } catch (error) {
    console.error("Error registering admin:", error);
    res.status(500).json({ msg: "Internal server error" });
  }
})







app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  connectDB();
});

