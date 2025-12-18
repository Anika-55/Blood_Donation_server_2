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


// ------------------- GET CURRENT USER -------------------
exports.getCurrentUser = async (req, res) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");

    const user = await users.findOne({ _id: req.user._id });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bloodGroup: user.bloodGroup,
      district: user.district,
      upazila: user.upazila,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- UPDATE CURRENT USER -------------------
exports.updateCurrentUser = async (req, res) => {
  try {
    const db = await connectDB();
    const users = db.collection("users");

    const { name, avatar, bloodGroup, district, upazila, password } = req.body;

    const updateData = {
      ...(name && { name }),
      ...(avatar && { avatar }),
      ...(bloodGroup && { bloodGroup }),
      ...(district && { district }),
      ...(upazila && { upazila }),
    };

    // If user wants to change password
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
    }

    await users.updateOne(
      { _id: req.user._id },
      { $set: updateData }
    );

    const updatedUser = await users.findOne({ _id: req.user._id });

    res.json({
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      bloodGroup: updatedUser.bloodGroup,
      district: updatedUser.district,
      upazila: updatedUser.upazila,
      role: updatedUser.role,
      status: updatedUser.status,
      createdAt: updatedUser.createdAt,
    });
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};
