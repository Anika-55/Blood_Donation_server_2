const express = require("express");
const router = express.Router();

const {
  getVolunteerStats,
  getAllDonationRequestsVolunteer,
  updateDonationStatusVolunteer,
} = require("../controllers/volunteer.controller");

const verifyToken = require("../middlewares/verifyToken");
const verifyRole = require("../middlewares/verifyRole");

/* ===============================
   Volunteer Dashboard Routes
   =============================== */

// Stats
router.get(
  "/stats",
  verifyToken,
  verifyRole("volunteer", "admin"),
  getVolunteerStats
);

// All donation requests (view only)
router.get(
  "/donation-requests",
  verifyToken,
  verifyRole("volunteer", "admin"),
  getAllDonationRequestsVolunteer
);

// Update donation status
router.patch(
  "/donation-requests/:id/status",
  verifyToken,
  verifyRole("volunteer", "admin"),
  updateDonationStatusVolunteer
);

module.exports = router;
