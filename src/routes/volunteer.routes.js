// routes/volunteer.routes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  getAllDonationRequests,
  updateDonationStatus,
  getSingleDonationRequest
} = require("../controllers/volunteer.controller");

// GET all donation requests (for volunteer)
router.get("/donations", protect, getAllDonationRequests);

// PATCH donation status
router.patch("/donations/:id/status", protect, updateDonationStatus);

// Get single donation request
router.get("/donations/:id", protect, getSingleDonationRequest);


module.exports = router;
