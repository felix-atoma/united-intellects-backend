const Subscriber = require("../models/Subscriber");

// Add a new subscriber
exports.addSubscriber = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required." });
        }

        // Basic email validation (you can enhance this)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format." });
        }

        console.log(`[SubscriberController] Checking if email '${email}' exists in database...`);
        const existingSubscriber = await Subscriber.findOne({ email });

        if (existingSubscriber) {
            console.log(`[SubscriberController] Email '${email}' already subscribed.`);
            return res.status(400).json({ error: "Email already subscribed." });
        }

        console.log(`[SubscriberController] Creating new subscriber '${email}'...`);
        const newSubscriber = new Subscriber({ email });
        await newSubscriber.save();

        console.log(`[SubscriberController] New subscriber added: ${email}`);
        res.status(201).json({ message: "Thank you for subscribing!", email });
    } catch (error) {
        console.error(`[SubscriberController] Server error adding subscriber: ${error.message}`);
        res.status(500).json({ error: "Internal server error." });
    }
};

// Get all subscribers
exports.getSubscribers = async (req, res) => {
    try {
        console.log("[SubscriberController] Fetching all subscribers...");
        const subscribers = await Subscriber.find();
        res.status(200).json(subscribers);
    } catch (error) {
        console.error(`[SubscriberController] Server error fetching subscribers: ${error.message}`);
        res.status(500).json({ error: "Internal server error." });
    }
};