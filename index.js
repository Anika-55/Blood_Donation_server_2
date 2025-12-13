require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const donationRoutes = require("./routes/donation.routes");
const donorRoutes = require("./routes/donor.routes");

const app = express();

app.use(cors());
app.use(express.json());

// prefix all auth routes with /api/auth
app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/donor", donorRoutes);




app.get("/", (req, res) => {
  res.send("Blood Donation Server Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
