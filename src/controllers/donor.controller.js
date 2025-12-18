// controllers/donor.controller.js
const { connectDB } = require("../config/db");
const { ObjectId } = require("mongodb");

/**
 * GET /api/donation-requests/dashboard
 * Get last 3 donation requests (Donor only)
 */
exports.dashboardHome = async (req, res) => {
  try {
    const db = await connectDB();
    const donationRequests = db.collection("donationRequests");

    const data = await donationRequests
      .find({ requestedBy: req.user.id }) // requestedBy stored as string
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    res.json(data);
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/donation-requests/my
 * Get donor's donation requests (pagination + filter)
 */
exports.myDonationRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const db = await connectDB();
    const donationRequests = db.collection("donationRequests");

    const filter = { requestedBy: req.user.id }; // store user id as string
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
    console.error("My requests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/donation-requests
 * Create new donation request (Donor)
 */
exports.createDonationRequest = async (req, res) => {
  try {
    const {
      recipientName,
      recipientDistrict,
      recipientUpazila,
      hospitalName,
      address,
      bloodGroup,
      donationDate,
      donationTime,
      message,
    } = req.body;

    if (
      !recipientName ||
      !recipientDistrict ||
      !recipientUpazila ||
      !bloodGroup ||
      !donationDate
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const db = await connectDB();
    const users = db.collection("users");
    const donationRequests = db.collection("donationRequests");

    const user = await users.findOne({ _id: new ObjectId(req.user.id) });

    if (!user || user.status === "blocked") {
      return res
        .status(403)
        .json({ message: "Blocked users cannot create requests" });
    }

    const doc = {
      requestedBy: req.user.id, // store as string
      recipientName,
      recipientDistrict,
      recipientUpazila,
      hospitalName: hospitalName || "",
      address: address || "",
      bloodGroup,
      donationDate,
      donationTime: donationTime || "",
      message: message || "",
      status: "pending",
      createdAt: new Date(),
    };

    const result = await donationRequests.insertOne(doc);

    res.status(201).json({
      message: "Donation request created successfully",
      requestId: result.insertedId,
    });
  } catch (err) {
    console.error("Create request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PATCH /api/donation-requests/:id/status
 * Donor can update status (only inprogress → done/canceled)
 */
exports.updateDonationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const id = req.params.id;

    if (!["done", "canceled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status change" });
    }

    const db = await connectDB();
    const donationRequests = db.collection("donationRequests");

    const request = await donationRequests.findOne({
      _id: new ObjectId(id),
    });

    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.requestedBy !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (request.status !== "inprogress") {
      return res
        .status(400)
        .json({ message: "Only inprogress requests can be updated" });
    }

    await donationRequests.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    res.json({ message: "Status updated successfully" });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * PATCH /api/donation-requests/:id
 * Donor edits own donation request (only pending or inprogress)
 */
exports.updateDonationRequest = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      recipientName,
      recipientDistrict,
      recipientUpazila,
      hospitalName,
      address,
      bloodGroup,
      donationDate,
      donationTime,
      message,
    } = req.body;

    const db = await connectDB();
    const donationRequests = db.collection("donationRequests");

    const request = await donationRequests.findOne({ _id: new ObjectId(id) });
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.requestedBy !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Only pending or inprogress can be edited
    if (!["pending", "inprogress"].includes(request.status)) {
      return res
        .status(400)
        .json({ message: "Only pending or inprogress requests can be edited" });
    }

    const updatedDoc = {
      recipientName: recipientName || request.recipientName,
      recipientDistrict: recipientDistrict || request.recipientDistrict,
      recipientUpazila: recipientUpazila || request.recipientUpazila,
      hospitalName: hospitalName || request.hospitalName,
      address: address || request.address,
      bloodGroup: bloodGroup || request.bloodGroup,
      donationDate: donationDate || request.donationDate,
      donationTime: donationTime || request.donationTime,
      message: message || request.message,
    };

    await donationRequests.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedDoc }
    );

    res.json({ message: "Donation request updated successfully" });
  } catch (err) {
    console.error("Update request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//Get single donation request by ID (Donor only)
exports.getSingleDonationRequest = async (req, res) => {
  try {
    const db = await connectDB();
    const donationRequests = db.collection("donationRequests");

    const request = await donationRequests.findOne({
      _id: new ObjectId(req.params.id),
      requestedBy: req.user.id,
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(request);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * DELETE /api/donation-requests/:id
 * Donor deletes own request (only pending)
 */
exports.deleteDonation = async (req, res) => {
  try {
    const id = req.params.id;

    const db = await connectDB();
    const donationRequests = db.collection("donationRequests");

    const request = await donationRequests.findOne({
      _id: new ObjectId(id),
    });

    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.requestedBy !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending requests can be deleted" });
    }

    await donationRequests.deleteOne({ _id: new ObjectId(id) });

    res.json({ message: "Donation request deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// **************++++++


exports.searchDonors = async (req, res) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");

    const { bloodGroup, district, upazila } = req.query;

    // Required filters (extra safety)
    if (!bloodGroup || !district || !upazila) {
      return res.status(400).json({ message: "Missing search parameters" });
    }

    const query = {
      role: "donor",
      status: "active",
      bloodGroup,
      district,
      upazila,
    };

    const donors = await users
      .find(query)
      .project({
        name: 1,
        bloodGroup: 1,
        district: 1,
        upazila: 1,
            email: 1, 
        lastDonationDate: 1, // optional
        _id: 1,
      })
      .limit(20)
      .toArray();

    res.json(donors);
  } catch (err) {
    console.error("Search donors error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




