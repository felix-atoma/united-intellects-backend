const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./db");
const subscriberRoutes = require("./routes/subscriberRoutes");

dotenv.config();

const app = express();
const PORT = process.env.INDEX_PORT || 5003;

// ✅ Allowed Origins for CORS
const allowedOrigins = [
    "https://united-intellects.vercel.app",
    "https://united-intellectuals.netlify.app",
    "http://localhost:5173",
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`[CORS] Blocked request from: ${origin}`);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};

// ✅ Middleware
app.use(cors(corsOptions));
app.use(express.json());

// ✅ Connect to MongoDB before starting the server
(async () => {
    try {
        await connectDB();
        console.log("[Server] MongoDB connected.");

        // ✅ Routes
        app.use("/api", subscriberRoutes);

        // ✅ Default route for testing
        app.get("/", (req, res) => {
            res.json({ message: "API is running..." });
        });

        // ✅ Start the server
        app.listen(PORT, () => {
            console.log(`[Server] Running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("[Server] MongoDB connection error:", err);
        process.exit(1); // Exit if DB connection fails
    }
})();
