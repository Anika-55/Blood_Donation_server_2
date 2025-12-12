// routes/donation.routes.js
const express = require("express");
const router = express.Router();
const {
  getPendingDonations,
  getDonationById,
} = require("../controllers/donation.controller");

const { protect } = require("../middleware/auth.middleware");

// Public route: pending donations
router.get("/", getPendingDonations);

// Private route: donation details
router.get("/:id", protect, getDonationById);

module.exports = router;
