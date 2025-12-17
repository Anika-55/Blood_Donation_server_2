// const { connectDB } = require("../config/db");
// const { ObjectId } = require("mongodb");

// /* ===============================
//    1️⃣ Volunteer Dashboard Stats
//    =============================== */
// exports.getVolunteerStats = async (req, res) => {
//   try {
//     const db = await connectDB();
//     const donations = db.collection("donationRequests");

//     const total = await donations.countDocuments();
//     const pending = await donations.countDocuments({ status: "pending" });
//     const inprogress = await donations.countDocuments({ status: "inprogress" });

//     res.json({
//       total,
//       pending,
//       inprogress,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// /* =============================================
//    2️⃣ Get All Blood Donation Requests (Volunteer)
//    - Pagination
//    - Status Filter
//    ============================================= */
// exports.getAllDonationRequestsVolunteer = async (req, res) => {
//   try {
//     const db = await connectDB();
//     const donations = db.collection("donationRequests");

//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const { status } = req.query;

//     const query = {};
//     if (status) query.status = status;

//     const total = await donations.countDocuments(query);

//     const data = await donations
//       .find(query)
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .sort({ donationDate: -1 })
//       .toArray();

//     res.json({ data, total });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// /* =========================================
//    3️⃣ Update Donation Status (Volunteer)
//    Allowed: pending → inprogress → done
//    ========================================= */
// exports.updateDonationStatusVolunteer = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const allowedStatus = ["pending", "inprogress", "done"];
//     if (!allowedStatus.includes(status)) {
//       return res.status(400).json({ message: "Invalid status" });
//     }

//     const db = await connectDB();
//     const donations = db.collection("donationRequests");

//     const donation = await donations.findOne({ _id: new ObjectId(id) });
//     if (!donation) {
//       return res.status(404).json({ message: "Donation request not found" });
//     }

//     await donations.updateOne(
//       { _id: new ObjectId(id) },
//       { $set: { status } }
//     );

//     res.json({
//       message: "Donation status updated successfully",
//       data: { _id: id, status },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
