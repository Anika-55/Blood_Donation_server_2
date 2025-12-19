require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const donationRoutes = require("./routes/donation.routes");
const donorRoutes = require("./routes/donor.routes");
const adminRoutes = require("./routes/admin.routes");
const volunteerRoutes = require("./routes/volunteer.routes");

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);   // ✅ public + private donation requests
app.use("/api/donor", donorRoutes);           // ✅ donor dashboard actions
app.use("/api/admin", adminRoutes);
app.use("/api/volunteer", volunteerRoutes);
// app.use("/api/donor", donorRoutes);
app.use("/api/contact", require("./routes/contact.routes"));


app.get("/", (req, res) => {
  res.send("Blood Donation Server Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});