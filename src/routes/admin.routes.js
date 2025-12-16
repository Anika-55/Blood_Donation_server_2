const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth.middleware");
const {
  getStats,
  getAllUsers,
  userActions,
  getAllDonationRequests,
  updateDonationStatus, // ✅ import the new controller
} = require("../controllers/admin.controller");

// Dashboard stats
router.get("/stats", protect, adminOnly, getStats);

// All users
router.get("/users", protect, adminOnly, getAllUsers);

// User actions
router.patch("/users/:id/:action", protect, adminOnly, userActions);

// All donation requests
router.get("/donations", protect, adminOnly, getAllDonationRequests);

// ✅ Update donation request status (Resolve / Reject)
router.patch(
  "/donations/:id/status",
  protect,
  adminOnly,
  updateDonationStatus
);

module.exports = router;
