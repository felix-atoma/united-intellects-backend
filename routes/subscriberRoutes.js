const express = require("express");
const router = express.Router();
const subscriberController = require("../controllers/subscriberController");

router.post("/subscribe", (req, res, next) => {
    console.log("[DEBUG] Received a POST request to /api/subscribe");
    console.log("[DEBUG] Request Body:", req.body);
    next();
}, subscriberController.addSubscriber);

router.get("/subscribers", subscriberController.getSubscribers);

module.exports = router;
