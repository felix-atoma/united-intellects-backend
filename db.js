const mongoose = require("mongoose");
require("dotenv").config(); // Ensure environment variables are loaded

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;

    // Validate MONGO_URI
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined. Check your environment variables.");
    }

    console.log("Attempting to connect to MongoDB...");

    // Connect to MongoDB
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`🟢 Connected to MongoDB successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error("🔴 MongoDB connection error:", error.message);

    // Log additional details for debugging
    if (error.name === "MongoNetworkError") {
      console.error("Network error. Check your MongoDB connection string and network settings.");
    } else if (error.name === "MongooseServerSelectionError") {
      console.error("Server selection error. Ensure MongoDB is running and accessible.");
    } else {
      console.error("Unknown error:", error);
    }

    process.exit(1); // Exit process if connection fails
  }
};

module.exports = connectDB;