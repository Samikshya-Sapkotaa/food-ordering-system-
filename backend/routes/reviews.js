const express = require("express");
const db = require("../config/db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router();

// POST /api/reviews — customer submits review after delivery
router.post("/", verifyToken, async (req, res) => {
  const { order_id, restaurant_id, rating, comment } = req.body;

  if (!order_id || !restaurant_id || !rating) {
    return res.status(400).json({ message: "order_id, restaurant_id and rating are required" });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    // Verify this order belongs to the user and is Delivered
    const [orders] = await db.query(
      "SELECT * FROM orders WHERE id = ? AND user_id = ? AND status = 'Delivered'",
      [order_id, req.user.id]
    );
    if (orders.length === 0) {
      return res.status(403).json({ message: "You can only review delivered orders that belong to you" });
    }

    // Prevent duplicate review
    const [existing] = await db.query("SELECT id FROM reviews WHERE order_id = ?", [order_id]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "You have already reviewed this order" });
    }

    await db.query(
      "INSERT INTO reviews (order_id, user_id, restaurant_id, rating, comment) VALUES (?, ?, ?, ?, ?)",
      [order_id, req.user.id, restaurant_id, rating, comment || ""]
    );

    // Update restaurant average rating
    const [ratingRows] = await db.query(
      "SELECT AVG(rating) AS avg_rating FROM reviews WHERE restaurant_id = ?",
      [restaurant_id]
    );
    const avg = ratingRows[0]?.avg_rating || rating;
    await db.query("UPDATE restaurants SET rating = ? WHERE id = ?", [
      parseFloat(avg).toFixed(1),
      restaurant_id,
    ]);

    res.json({ message: "Review submitted successfully" });
  } catch (err) {
    console.error("[reviews POST]", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/reviews/recent — public, get recent customer reviews across the platform
router.get("/recent", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT r.*, COALESCE(u.name, r.user_name, 'Valued Customer') AS customer_name, " +
      "rest.name AS restaurant_name, COALESCE(rest.image, rest.image_url, '') AS restaurant_image " +
      "FROM reviews r " +
      "LEFT JOIN users u ON r.user_id = u.id " +
      "LEFT JOIN restaurants rest ON r.restaurant_id = rest.id " +
      "ORDER BY r.id DESC LIMIT 6"
    );
    res.json(rows);
  } catch (err) {
    console.error("[reviews GET recent]", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/reviews/restaurant/:id — public, get all reviews for a restaurant
router.get("/restaurant/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, u.name AS customer_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.restaurant_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("[reviews GET restaurant]", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/reviews/all — admin sees all reviews
router.get("/all", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, u.name AS customer_name, rest.name AS restaurant_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN restaurants rest ON r.restaurant_id = rest.id
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("[reviews GET all]", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/reviews/check/:orderId — check if order already reviewed
router.get("/check/:orderId", verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id FROM reviews WHERE order_id = ? AND user_id = ?",
      [req.params.orderId, req.user.id]
    );
    res.json({ reviewed: rows.length > 0 });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
