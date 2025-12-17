// middleware/auth.middleware.js
const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "Unauthorized: No token provided" });

  const token = authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Unauthorized: Token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // decoded should contain user info including role
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Only allow admin users
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }
  next();
};


// 🔓 Volunteer OR Admin
exports.volunteerOrAdmin = (req, res, next) => {
  if (!["volunteer", "admin"].includes(req.user?.role)) {
    return res.status(403).json({ message: "Forbidden: Volunteer/Admin only" });
  }
  next();
};
