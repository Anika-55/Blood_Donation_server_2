// controllers/volunteer.controller.js
const { connectDB } = require("../config/db");
const { ObjectId } = require("mongodb");

// GET all donation requests (with pagination + filter)
exports.getAllDonationRequests = async (req, res) => {
  try {
    if (req.user.role !== "volunteer")
      return res.status(403).json({ message: "Forbidden" });

    const { status, page = 1, limit = 10 } = req.query;
    const db = await connectDB();
    const donationRequests = db.collection("donationRequests");

    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await donationRequests.countDocuments(filter);
    const data = await donationRequests
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .toArray();

    res.json({
      data,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("Volunteer getAllDonationRequests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH donation status (inprogress → done/canceled)
exports.updateDonationStatus = async (req, res) => {
  try {
    if (req.user.role !== "volunteer")
      return res.status(403).json({ message: "Forbidden" });

    const { status } = req.body;
    const id = req.params.id;

    if (!["done", "canceled", "inprogress"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const db = await connectDB();
    const donationRequests = db.collection("donationRequests");

    const request = await donationRequests.findOne({ _id: new ObjectId(id) });
    if (!request) return res.status(404).json({ message: "Request not found" });

    await donationRequests.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    res.json({ message: "Status updated successfully" });
  } catch (err) {
    console.error("Volunteer updateDonationStatus error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/volunteer/donations/:id
exports.getSingleDonationRequest = async (req, res) => {
  try {
    if (req.user.role !== "volunteer")
      return res.status(403).json({ message: "Forbidden" });

    const db = await connectDB();
    const donationRequests = db.collection("donationRequests");

    const request = await donationRequests.findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!request)
      return res.status(404).json({ message: "Donation request not found" });

    res.json(request);
  } catch (err) {
    console.error("Volunteer getSingleDonationRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

