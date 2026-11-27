// JWT authentication middleware with multi-role checks (customer, hotel, delivery, main admin)
const jwt = require("jsonwebtoken");
require("dotenv").config();

function verifyToken(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Allows Restaurant Owners, Hotel Managers, Admin, and SuperAdmin
function verifyAdmin(req, res, next) {
  if (!["admin", "superadmin", "restaurant", "hotel"].includes(req.user.role)) {
    return res.status(403).json({ message: "Restaurant or Admin access required" });
  }
  next();
}

// Allows Main Backend Admin / SuperAdmin
function verifyMainAdmin(req, res, next) {
  if (!["admin", "superadmin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Main Admin access required" });
  }
  next();
}

module.exports = { verifyToken, verifyAdmin, verifyMainAdmin };
