const express = require("express");
const router = express.Router();
const subscriberController = require("../controllers/subscriberController");

// POST /api/subscribe - Add a new subscriber
router.post("/subscribe", subscriberController.addSubscriber);

// GET /api/subscribers - Get all subscribers
router.get("/subscribers", subscriberController.getSubscribers);

module.exports = router;