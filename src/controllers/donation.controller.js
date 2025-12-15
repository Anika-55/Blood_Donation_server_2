const { connectDB } = require("../config/db");
const { ObjectId } = require("mongodb");

/**
 * PUBLIC – Get all pending donation requests
 * GET /api/donations?status=pending
 */
exports.getPendingDonations = async (req, res) => {
  try {
    const db = await connectDB();
    const donationRequests = db.collection("donationRequests");

    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const data = await donationRequests
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.json(data);
  } catch (err) {
    console.error("getPendingDonations error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PRIVATE – Get single donation request
 * GET /api/donations/:id
 */
exports.getDonationById = async (req, res) => {
  try {
    const db = await connectDB();
    const donationRequests = db.collection("donationRequests");

    const donation = await donationRequests.findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!donation) {
      return res.status(404).json({ message: "Donation request not found" });
    }

    res.json(donation);
  } catch (err) {
    console.error("getDonationById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
