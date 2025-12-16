// controllers/admin.controller.js
const { connectDB } = require("../config/db");
const { ObjectId } = require("mongodb");

// 1️⃣ Get dashboard statistics
exports.getStats = async (req, res) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");
    const donations = db.collection("donations");
    const moneyDonations = db.collection("moneyDonations");

    const totalUsers = await users.countDocuments();
    const totalFundsAgg = await moneyDonations.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).toArray();
    const totalFunds = totalFundsAgg[0]?.total || 0;
    const totalBloodRequests = await donations.countDocuments();

    res.json({ totalUsers, totalFunds, totalBloodRequests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 2️⃣ Get all users with optional status filter
exports.getAllUsers = async (req, res) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");

    const query = {};
    if (req.query.status) query.status = req.query.status;

    const allUsers = await users.find(query).toArray();
    res.json(allUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 3️⃣ User actions: block, unblock, make-volunteer, make-admin
exports.userActions = async (req, res) => {
  try {
    const { id, action } = req.params;
    const db = await connectDB();
    const users = db.collection("users");

    const user = await users.findOne({ _id: new ObjectId(id) });
    if (!user) return res.status(404).json({ message: "User not found" });

    let update = {};
    if (action === "block") update.status = "blocked";
    else if (action === "unblock") update.status = "active";
    else if (action === "make-volunteer") update.role = "volunteer";
    else if (action === "make-admin") update.role = "admin";
    else return res.status(400).json({ message: "Invalid action" });

    await users.updateOne({ _id: new ObjectId(id) }, { $set: update });
    res.json({ message: "Action performed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// 4️⃣ Get all blood donation requests (admin view)

exports.getAllDonationRequests = async (req, res) => {
  try {
    const db = await connectDB();
    const donations = db.collection("donationRequests"); // ✅ use the same collection

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { status } = req.query;

    const query = {};
    if (status) query.status = status;

    const total = await donations.countDocuments(query);
    const data = await donations
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    res.json({ data, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 5️⃣ Update donation request status (Resolve/Reject)
exports.updateDonationStatus = async (req, res) => {
  try {
    const { id } = req.params; // donation request ID
    const { status } = req.body; // new status: "inprogress" or "canceled"

    if (!["inprogress", "canceled", "done"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const db = await connectDB();
    const donations = db.collection("donationRequests");

    const donation = await donations.findOne({ _id: new ObjectId(id) });
    if (!donation)
      return res.status(404).json({ message: "Donation request not found" });

    await donations.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    res.json({ message: "Status updated successfully", data: { _id: id, status } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

