const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");

const {
  getPendingDonations,
  getDonationById,
} = require("../controllers/donation.controller");

// PUBLIC – list pending requests
router.get("/", getPendingDonations);

// PRIVATE – request details
router.get("/:id", protect, getDonationById);

module.exports = router;
