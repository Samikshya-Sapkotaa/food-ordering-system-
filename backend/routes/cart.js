// Cart routes - all of these need the user to be logged in
const express = require("express");
const db = require("../config/db");
const { verifyToken } = require("../middleware/auth");

const router = express.Router();

// every route below needs a valid token
router.use(verifyToken);

// GET /api/cart  -> all items in the logged in user's cart
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.id, c.quantity,
              f.id AS food_id, f.name, f.price, f.is_available,
              COALESCE(f.image, f.image_url, '') AS image,
              cat.name AS category_name,
              r.name AS restaurant_name
       FROM cart c
       JOIN food_items f ON c.food_id = f.id
       LEFT JOIN categories cat ON f.category_id = cat.id
       LEFT JOIN restaurants r ON f.restaurant_id = r.id
       WHERE c.user_id = ?
       ORDER BY c.id`,
      [req.user.id]
    );

    let total = 0;
    rows.forEach((item) => {
      total = total + Number(item.price) * item.quantity;
    });

    res.json({ items: rows, total: total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/cart  -> add item to cart (if already there, quantity + 1)
router.post("/", async (req, res) => {
  const { food_id } = req.body;

  if (!food_id) {
    return res.status(400).json({ message: "food_id is required" });
  }

  try {
    // make sure the item exists and is available
    const [food] = await db.query(
      "SELECT * FROM food_items WHERE id = ? AND is_available = 1",
      [food_id]
    );

    if (food.length === 0) {
      return res.status(400).json({ message: "Food item not available" });
    }

    // check if it is already in the cart
    const [existing] = await db.query(
      "SELECT * FROM cart WHERE user_id = ? AND food_id = ?",
      [req.user.id, food_id]
    );

    if (existing.length > 0) {
      await db.query("UPDATE cart SET quantity = quantity + 1 WHERE id = ?", [
        existing[0].id,
      ]);
    } else {
      await db.query(
        "INSERT INTO cart (user_id, food_id, quantity) VALUES (?, ?, 1)",
        [req.user.id, food_id]
      );
    }

    res.json({ message: "Added to cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/cart/:id  -> increase or decrease quantity
// body: { action: "increase" }  or  { action: "decrease" }  or { quantity: N }
router.put("/:id", async (req, res) => {
  const { action, quantity } = req.body;

  try {
    // make sure this cart row belongs to the logged in user
    const [rows] = await db.query(
      "SELECT * FROM cart WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const item = rows[0];

    // Support explicit quantity update
    if (typeof quantity === "number" || typeof quantity === "string") {
      const newQty = parseInt(quantity, 10);
      if (newQty <= 0) {
        await db.query("DELETE FROM cart WHERE id = ?", [item.id]);
      } else {
        await db.query("UPDATE cart SET quantity = ? WHERE id = ?", [newQty, item.id]);
      }
    } else if (action === "increase") {
      await db.query("UPDATE cart SET quantity = quantity + 1 WHERE id = ?", [
        item.id,
      ]);
    } else if (action === "decrease") {
      if (item.quantity <= 1) {
        await db.query("DELETE FROM cart WHERE id = ?", [item.id]);
      } else {
        await db.query("UPDATE cart SET quantity = quantity - 1 WHERE id = ?", [
          item.id,
        ]);
      }
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    res.json({ message: "Cart updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/cart/:id  -> remove one item from cart
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM cart WHERE id = ? AND user_id = ?", [
      req.params.id,
      req.user.id,
    ]);
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/cart  -> empty the whole cart
router.delete("/", async (req, res) => {
  try {
    await db.query("DELETE FROM cart WHERE user_id = ?", [req.user.id]);
    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
