require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const connectDB = require("./db");

const app = express();

// ✅ Allowed Origins for CORS
const allowedOrigins = [
  "https://united-intellects.vercel.app",
  "https://united-intellectuals.netlify.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("🚫 Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Connect to MongoDB
connectDB()
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((error) => console.error("❌ MongoDB Connection Error:", error));

// ✅ Root Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to United-Intellects Backend!" });
});

// ✅ Health Check Route
app.get("/ping", (req, res) => {
  res.status(200).json({ message: "Backend is running!" });
});

// ✅ Contact Form Schema
const contactSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  address: String,
  subject: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const Contact = mongoose.model("Contact", contactSchema);

// ✅ Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Use a business email, not a personal Gmail
    pass: process.env.EMAIL_PASS,
  },
});

const CLIENT_EMAIL = process.env.CLIENT_EMAIL;

// ✅ Contact Form Submission Route
app.post("/contact", async (req, res) => {
  console.log("📩 Incoming request from:", req.headers.origin);
  console.log("Request Body:", req.body);

  const { fullName, email, phone, address, subject, message } = req.body;

  if (!fullName || !email || !message) {
    return res.status(400).json({ error: "Full name, email, and message are required" });
  }

  try {
    // Save data to MongoDB
    const newContact = new Contact({ fullName, email, phone, address, subject, message });
    await newContact.save();
    console.log("✅ Data saved to MongoDB");

    // Send email to the client (United Intellects team)
    await transporter.sendMail({
      from: `"${fullName}" <noreply@united-intellects.com>`, // Prevents personal email from showing
      to: CLIENT_EMAIL,
      subject: `New Contact Form Submission from ${fullName}`,
      text: `Name: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${address}\nSubject: ${subject}\nMessage: ${message}`,
      replyTo: email, // Ensures replies go to the client
    });

    // Send confirmation email to the user
    await transporter.sendMail({
      from: `"United Intellects" <noreply@united-intellects.com>`, // Professional sender email
      to: email,
      subject: `Thank you for contacting us, ${fullName}`,
      text: `Dear ${fullName},\n\nThank you for reaching out! We have received your message and will get back to you shortly.\n\nBest regards,\nUnited-Intellects`,
    });

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Failed to send the message. Please try again." });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
