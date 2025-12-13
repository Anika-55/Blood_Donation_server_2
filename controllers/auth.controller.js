const { connectDB } = require("../config/db");
const bcrypt = require("bcrypt");
const hashPassword = require("../utils/hashPassword");
const generateToken = require("../utils/generateToken"); // your JWT function

// ------------------- REGISTER -------------------
exports.registerUser = async (req, res) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");

    const { name, email, password, avatar, bloodGroup, district, upazila } = req.body;

    if (!name || !email || !password || !bloodGroup || !district || !upazila) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await users.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashed = await hashPassword(password);

    const newUser = {
      name,
      email,
      password: hashed,
      avatar, // just URL
      bloodGroup,
      district,
      upazila,
      role: "donor",
      status: "active",
      createdAt: new Date(),
    };

    const result = await users.insertOne(newUser);

    const token = generateToken({ _id: result.insertedId, role: newUser.role });

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: result.insertedId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      accessToken: token, // <-- add token here
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- LOGIN -------------------
exports.loginUser = async (req, res) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");

    const { email, password } = req.body;
    const user = await users.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid email" });
    if (user.status === "blocked") return res.status(403).json({ message: "User is blocked" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    // Generate JWT
    const token = generateToken(user);

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token, // <-- return token
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
