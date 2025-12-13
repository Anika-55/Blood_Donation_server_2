const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");

const {
  dashboardHome,
  myDonationRequests,
  createDonationRequest,
  updateDonationStatus,
  updateDonationRequest,
  deleteDonation,
} = require("../controllers/donor.controller");

// last 3 requests (dashboard)
router.get("/dashboard", protect, dashboardHome);

// my requests (pagination + filter)
router.get("/my", protect, myDonationRequests);

// Update donation request fully (edit) - pending or inprogress only
router.patch("/:id", protect, updateDonationRequest);

// create request
router.post("/", protect, createDonationRequest);

// update status
router.patch("/:id/status", protect, updateDonationStatus);

// delete
router.delete("/:id", protect, deleteDonation);

module.exports = router;
