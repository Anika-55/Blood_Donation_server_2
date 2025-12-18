const { connectDB } = require("../config/db");

exports.submitContact = async (req, res) => {
  try {
    const db = await connectDB();
    const contacts = db.collection("contacts");

    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ message: "All fields required" });

    await contacts.insertOne({
      name,
      email,
      message,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Message received" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
