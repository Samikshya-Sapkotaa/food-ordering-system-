// Routes for register, login, user profile, and Main Admin user management
const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const db      = require("../config/db");
const { verifyToken, verifyMainAdmin } = require("../middleware/auth");
require("dotenv").config();

const router = express.Router();

const ALLOWED_ROLES = ["customer", "restaurant"];

// Helper: sign a JWT with 7-day expiry
function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// POST /api/auth/register (Supports registering as Customer or Restaurant)
router.post("/register", async (req, res) => {
  const { name, email, phone, address, password, role } = req.body;

  // trim inputs
  const trimmed = {
    name:    (name    || "").trim(),
    email:   (email   || "").trim().toLowerCase(),
    phone:   (phone   || "").trim(),
    address: (address || "").trim(),
    password:(password|| ""),
    role:    (role    || "").trim().toLowerCase(),
  };

  if (!trimmed.name || !trimmed.email || !trimmed.phone || !trimmed.address || !trimmed.password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (trimmed.password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  // Sanitize role
  const selectedRole = ALLOWED_ROLES.includes(trimmed.role) ? trimmed.role : "customer";

  try {
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [trimmed.email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(trimmed.password, 10);

    const [userRes] = await db.query(
      "INSERT INTO users (name, email, phone, address, password, role) VALUES (?, ?, ?, ?, ?, ?)",
      [trimmed.name, trimmed.email, trimmed.phone, trimmed.address, hashedPassword, selectedRole]
    );

    const newUserId = userRes.insertId;

    // If registering as a restaurant, create a pending restaurant application record
    if (selectedRole === "restaurant") {
      const restName = (req.body.restaurant_name || trimmed.name).trim();
      const cuisine = (req.body.cuisine || "Nepali, Fast Food").trim();
      const panNumber = (req.body.pan_number || "").trim();
      const dftqc = (req.body.dftqc_license || "").trim();
      const vat = (req.body.vat_number || "").trim();

      await db.query(
        "INSERT INTO restaurants (user_id, name, address, phone, cuisine, pan_number, dftqc_license, vat_number, is_approved, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 1)",
        [newUserId, restName, trimmed.address, trimmed.phone, cuisine, panNumber, dftqc, vat]
      );
    }

    res.json({
      message: selectedRole === "restaurant"
        ? "Restaurant registration submitted! Your application is pending Admin KYC review."
        : `Registration successful as ${selectedRole.toUpperCase()}. Please login.`
    });
  } catch (err) {
    console.error("[register]", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const trimmedEmail = (email || "").trim().toLowerCase();

  if (!trimmedEmail || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [trimmedEmail]);
    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = rows[0];
    if (user.is_blocked) {
      return res.status(403).json({ message: "Your account has been blocked by Admin" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = signToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id:      user.id,
        name:    user.name,
        email:   user.email,
        phone:   user.phone,
        address: user.address,
        role:    user.role,
        restaurant_id: user.restaurant_id || 1,
      },
    });
  } catch (err) {
    console.error("[login]", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// POST /api/auth/refresh  — silently renew token using existing valid token
router.post("/refresh", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, phone, address, role, is_blocked, restaurant_id FROM users WHERE id = ?",
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    const user = rows[0];
    if (user.is_blocked) return res.status(403).json({ message: "Account is blocked" });
    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error("[refresh]", err);
    res.status(500).json({ message: "Server error during token refresh" });
  }
});

// GET /api/auth/me (Returns logged in user profile)
router.get("/me", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, phone, address, role, is_blocked, restaurant_id FROM users WHERE id = ?",
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── MAIN ADMIN USER MANAGEMENT ROUTES ────────────────────────

// GET /api/auth/users (Main Admin sees ALL users in the system + linked restaurant profiles)
router.get("/users", verifyToken, verifyMainAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT u.id, u.name, u.email, u.phone, u.address, u.role, u.is_blocked, u.created_at, " +
      "r.id AS restaurant_id, r.name AS restaurant_name, COALESCE(r.cuisines, r.cuisine, '') AS restaurant_cuisines " +
      "FROM users u " +
      "LEFT JOIN restaurants r ON r.user_id = u.id " +
      "ORDER BY u.id DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/auth/users/:id/reset-password (Main Admin resets any user's password)
router.put("/users/:id/reset-password", verifyToken, verifyMainAdmin, async (req, res) => {
  const { new_password } = req.body;

  if (!new_password || new_password.trim().length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const hashedPassword = await bcrypt.hash(new_password.trim(), 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, req.params.id]);
    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("[reset-password]", err);
    res.status(500).json({ message: "Server error resetting password" });
  }
});

// PUT /api/auth/users/:id/block (Main Admin toggles user block status)
router.put("/users/:id/block", verifyToken, verifyMainAdmin, async (req, res) => {
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ message: "You cannot block your own account" });
  }
  try {
    await db.query("UPDATE users SET is_blocked = NOT is_blocked WHERE id = ?", [req.params.id]);
    res.json({ message: "User status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/auth/users/:id/role (Main Admin changes user role)
router.put("/users/:id/role", verifyToken, verifyMainAdmin, async (req, res) => {
  const { role } = req.body;
  const validRoles = ["customer", "restaurant", "admin", "superadmin"];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role specified" });
  }

  try {
    await db.query("UPDATE users SET role = ? WHERE id = ?", [role, req.params.id]);
    res.json({ message: `User role updated to ${role}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/auth/users/:id (Main Admin deletes user)
router.delete("/users/:id", verifyToken, verifyMainAdmin, async (req, res) => {
  // Prevent admin from deleting themselves
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }

  try {
    await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: "User account deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
