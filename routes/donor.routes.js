const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");

const {
  dashboardHome,
  myDonationRequests,
  createDonationRequest,
  updateDonationStatus,
  deleteDonation,
} = require("../controllers/donor.controller");

// last 3 requests (dashboard)
router.get("/dashboard", protect, dashboardHome);

// my requests (pagination + filter)
router.get("/my", protect, myDonationRequests);

// create request
router.post("/", protect, createDonationRequest);

// update status
router.patch("/:id/status", protect, updateDonationStatus);

// delete
router.delete("/:id", protect, deleteDonation);

module.exports = router;
