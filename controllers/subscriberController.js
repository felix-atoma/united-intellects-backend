const Subscriber = require("../models/Subscriber");

// Add a new subscriber
exports.addSubscriber = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    console.log("Checking if email exists in database...");
    const existingSubscriber = await Subscriber.findOne({ email });

    if (existingSubscriber) {
      return res.status(400).json({ message: "Email already subscribed." });
    }

    console.log("Creating new subscriber...");
    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    console.log("New subscriber added:", email);
    res.status(201).json({ message: "Thank you for subscribing!", email });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all subscribers
exports.getSubscribers = async (req, res) => {
  try {
    console.log("Fetching all subscribers...");
    const subscribers = await Subscriber.find();
    res.status(200).json(subscribers);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};