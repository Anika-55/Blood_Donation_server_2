// controllers/donation.controller.js
const { connectDB } = require("../config/db");
const { ObjectId } = require("mongodb");

// Get all pending donation requests
exports.getPendingDonations = async (req, res) => {
  try {
    const db = await connectDB();
    const donations = db.collection("donations");

    const pending = await donations.find({ status: "pending" }).toArray();

    res.json(pending);
  } catch (err) {
    console.error("Error fetching donations:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single donation request by ID (private)
exports.getDonationById = async (req, res) => {
  try {
    const db = await connectDB();
    const donations = db.collection("donations");

    const { id } = req.params;
    const donation = await donations.findOne({ _id: new ObjectId(id) });

    if (!donation) return res.status(404).json({ message: "Donation not found" });

    res.json(donation);
  } catch (err) {
    console.error("Error fetching donation:", err);
    res.status(500).json({ message: "Server error" });
  }
};
