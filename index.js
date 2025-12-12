require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const donationRoutes = require("./routes/donation.routes");

const app = express();

app.use(cors());
app.use(express.json());

// prefix all auth routes with /api/auth
app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
