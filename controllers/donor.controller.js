const connectDB = require("../config/db");
const { ObjectId } = require("mongodb");

/**
 * GET /api/donor/dashboard
 * Last 3 donation requests (own)
 */
exports.dashboardHome = async (req, res) => {
  try {
    const db = await connectDB();
    const donations = db.collection("donations");

    const data = await donations
      .find({ requesterId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/donor/my-requests
 * All donation requests (own) + filter
 */
exports.myDonationRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const db = await connectDB();
    const donations = db.collection("donations");

    const query = { requesterId: req.user.id };
    if (status) query.status = status;

    const data = await donations.find(query).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/donor/create
 * Create donation request
 */
exports.createDonationRequest = async (req, res) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");
    const donations = db.collection("donations");

    const user = await users.findOne({ _id: new ObjectId(req.user.id) });

    if (user.status === "blocked")
      return res.status(403).json({ message: "Blocked user cannot create request" });

    const donation = {
      requesterId: req.user.id,
      requesterName: user.name,
      requesterEmail: user.email,

      recipientName: req.body.recipientName,
      recipientDistrict: req.body.recipientDistrict,
      recipientUpazila: req.body.recipientUpazila,
      hospitalName: req.body.hospitalName,
      address: req.body.address,
      bloodGroup: req.body.bloodGroup,
      donationDate: req.body.donationDate,
      donationTime: req.body.donationTime,
      message: req.body.message,

      status: "pending",
      createdAt: new Date(),
    };

    await donations.insertOne(donation);
    res.status(201).json({ message: "Donation request created" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /api/donor/status/:id
 * Update donation status
 */
exports.updateDonationStatus = async (req, res) => {
  try {
    const db = await connectDB();
    await db.collection("donations").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: req.body.status } }
    );

    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /api/donor/:id
 * Delete donation request
 */
exports.deleteDonation = async (req, res) => {
  try {
    const db = await connectDB();
    await db.collection("donations").deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
