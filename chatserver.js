require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const axios = require("axios");
const nodemailer = require("nodemailer");
const connectDB = require("./db"); // Import the connectDB function

const app = express();
const server = http.createServer(app);

// ✅ Allow CORS for frontend
const allowedOrigins = [
  "https://united-intellects.vercel.app",
  "https://united-intellectuals.netlify.app",
  "http://localhost:5173",
  "http://localhost", // Allow Postman and other local clients
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS: ", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Connect to MongoDB using the connectDB function
connectDB();

// ✅ Chat Message Schema
const chatSchema = new mongoose.Schema({
  sender: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const ChatMessage = mongoose.model("ChatMessage", chatSchema);

// ✅ Nodemailer Configuration (Same as contact server)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Socket.IO Setup
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log("New client connected");

  // Send previous messages to the client
  ChatMessage.find()
    .sort({ timestamp: 1 })
    .then((messages) => {
      socket.emit("previousMessages", messages);
    })
    .catch((err) => {
      console.error("Error fetching previous messages:", err);
    });

  // Listen for new messages
  socket.on("sendMessage", async (data) => {
    const { sender, message } = data;

    try {
      // Save message to MongoDB
      const newMessage = new ChatMessage({ sender, message });
      await newMessage.save();
      console.log("Message saved to MongoDB:", newMessage);

      // Broadcast the message to all clients
      io.emit("receiveMessage", newMessage);

      // Notify site owner if the sender is a user
      if (sender === "User") {
        await notifySiteOwner(newMessage);
      }

      // Generate AI response if the sender is a user
      if (sender === "User") {
        const aiResponse = await generateAIResponse(message);
        if (aiResponse) {
          const aiMessage = new ChatMessage({ sender: "AI", message: aiResponse });
          await aiMessage.save();
          io.emit("receiveMessage", aiMessage);
        }
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  // Handle client disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// ✅ Notify Site Owner via Email
const notifySiteOwner = async (message) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.CLIENT_EMAIL,
      subject: `New Chat Message from ${message.sender}`,
      text: `You have received a new message:\n\nSender: ${message.sender}\nMessage: ${message.message}`,
    });
    console.log("Site owner notified successfully");
  } catch (error) {
    console.error("Failed to notify site owner:", error);
  }
};

// ✅ Generate AI Response using DeepAI
const generateAIResponse = async (message) => {
  try {
    const response = await axios.post(
      "https://api.deepai.org/api/text-generator",
      { text: message },
      {
        headers: {
          "api-key": process.env.DEEP_AI_API_KEY, // Use DeepAI API key from .env
        },
      }
    );

    return response.data.output; // Return the generated text
  } catch (error) {
    console.error("DeepAI API error:", error.response ? error.response.data : error.message);
    return null;
  }
};

// ✅ HTTP Endpoint for Testing
app.post("/send-message", async (req, res) => {
  const { sender, message } = req.body;

  if (!sender || !message) {
    return res.status(400).json({ error: "Sender and message are required" });
  }

  try {
    // Save message to MongoDB
    const newMessage = new ChatMessage({ sender, message });
    await newMessage.save();
    console.log("Message saved to MongoDB:", newMessage);

    // Broadcast the message to all clients
    io.emit("receiveMessage", newMessage);

    // Notify site owner if the sender is a user
    if (sender === "User") {
      await notifySiteOwner(newMessage);
    }

    // Generate AI response if the sender is a user
    if (sender === "User") {
      const aiResponse = await generateAIResponse(message);
      if (aiResponse) {
        const aiMessage = new ChatMessage({ sender: "AI", message: aiResponse });
        await aiMessage.save();
        io.emit("receiveMessage", aiMessage);
      }
    }

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error handling message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// ✅ Start Chat Server on Port 5001
const PORT = process.env.CHAT_PORT || 5001;
server.listen(PORT, () => {
  console.log(`Chat Server running on port ${PORT}`);
});