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

router.get("/dashboard", protect, dashboardHome);
router.get("/my-requests", protect, myDonationRequests);
router.post("/create", protect, createDonationRequest);
router.patch("/status/:id", protect, updateDonationStatus);
router.delete("/:id", protect, deleteDonation);

module.exports = router;
