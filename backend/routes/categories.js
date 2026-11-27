const express = require("express");
const db = require("../config/db");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// GET /api/categories (public)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categories ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/categories (admin or restaurant manager)
router.post("/", verifyToken, async (req, res) => {
  const { name, description, icon, bg_color } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  const iconVal = icon || "🍽️";
  const bgVal = bg_color || "#fff7ed";

  try {
    await db.query("INSERT INTO categories (name, description, icon, bg_color) VALUES (?, ?, ?, ?)", [
      name,
      description || "",
      iconVal,
      bgVal,
    ]);
    res.json({ message: "Category added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/categories/:id (admin or restaurant manager)
router.put("/:id", verifyToken, async (req, res) => {
  const { name, description, icon, bg_color } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    await db.query(
      "UPDATE categories SET name = ?, description = ?, icon = ?, bg_color = ? WHERE id = ?",
      [name, description || "", icon || "🍽️", bg_color || "#fff7ed", req.params.id]
    );
    res.json({ message: "Category updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/categories/:id (admin or restaurant manager)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await db.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
