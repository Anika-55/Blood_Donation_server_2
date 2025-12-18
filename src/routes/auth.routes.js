const express = require("express");
const { registerUser, loginUser, getCurrentUser, updateCurrentUser } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");



const router = express.Router();

// handlers must be functions
router.post("/register", registerUser);
router.post("/login", loginUser);

// Get logged-in user info
router.get("/me", protect, getCurrentUser);
router.put("/me", protect, updateCurrentUser); 

module.exports = router;
