// routes/admin.routes.js
const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth.middleware");
const {
  getStats,
  getAllUsers,
  userActions,
  getAllDonationRequests,
  getDonationById,
  updateDonationStatus,
  deleteDonationRequest,
} = require("../controllers/admin.controller");

/* ------------------- Dashboard ------------------- */
// GET /api/admin/stats
router.get("/stats", protect, adminOnly, getStats);

/* ------------------- Users ------------------- */
// GET /api/admin/users?status=active
router.get("/users", protect, adminOnly, getAllUsers);

// PATCH /api/admin/users/:id/:action
// action: block | unblock | make-volunteer | make-admin
router.patch("/users/:id/:action", protect, adminOnly, userActions);

/* ------------------- Donation Requests ------------------- */
// GET /api/admin/donations?page=1&limit=10&status=inprogress
router.get("/donations", protect, adminOnly, getAllDonationRequests);

// GET /api/admin/donations/:id
router.get("/donations/:id", protect, adminOnly, getDonationById);

// PATCH /api/admin/donations/:id/status
router.patch("/donations/:id/status", protect, adminOnly, updateDonationStatus);

// DELETE /api/admin/donations/:id
router.delete("/donations/:id", protect, adminOnly, deleteDonationRequest);

module.exports = router;
