// controllers/authController.js
const connectDB = require("../config/db");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const hashPassword = require("../utils/hashPassword");
const { ObjectId } = require("mongodb");

exports.registerUser = async (req, res) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");

    const { name, email, password, avatar, bloodGroup, district, upazila } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await users.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    const hashed = await hashPassword(password);

    const newUser = {
      name,
      email,
      password: hashed,
      avatar,
      bloodGroup,
      district,
      upazila,
      role: "donor",
      status: "active",
      createdAt: new Date(),
    };

    const result = await users.insertOne(newUser);

    res.json({ message: "Registration successful", userId: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");

    const { email, password } = req.body;

    const user = await users.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email" });

    if (user.status === "blocked")
      return res.status(403).json({ message: "User is blocked" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
