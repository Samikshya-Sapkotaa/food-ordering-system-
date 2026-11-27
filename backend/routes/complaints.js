const express = require("express");
const db = require("../config/db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// POST /api/complaints — customer submits a complaint
router.post("/", verifyToken, async (req, res) => {
  const { subject, description, order_id } = req.body;
  if (!subject || !description) {
    return res.status(400).json({ message: "Subject and description are required" });
  }
  try {
    await db.query(
      "INSERT INTO complaints (user_id, order_id, subject, description) VALUES (?, ?, ?, ?)",
      [req.user.id, order_id || null, subject, description]
    );
    res.json({ message: "Complaint submitted. Our team will review it soon." });
  } catch (err) {
    console.error("[complaints POST]", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/complaints/my — customer's own complaints
router.get("/my", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("[complaints GET my]", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/complaints/all — admin sees all complaints
router.get("/all", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, u.name AS customer_name, u.email AS customer_email
       FROM complaints c
       JOIN users u ON c.user_id = u.id
       ORDER BY c.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("[complaints GET all]", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/complaints/:id/resolve — admin marks as resolved
router.put("/:id/resolve", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await db.query("UPDATE complaints SET status = 'Resolved' WHERE id = ?", [req.params.id]);
    res.json({ message: "Complaint marked as resolved" });
  } catch (err) {
    console.error("[complaints PUT resolve]", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
