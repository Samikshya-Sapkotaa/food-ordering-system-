// Order routes
const express = require("express");
const db = require("../config/db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const { groupCartItemsByRestaurant } = require("../utils/orderGrouping");

const router = express.Router();

// all order routes need login
router.use(verifyToken);

// Swiggy/Zomato full lifecycle status list
const STATUS_LIST = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready for Pickup",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

// ----------------------------------------------------------
// POST /api/orders  -> place order (Cash on Delivery)
// takes whatever is in the cart and converts it into an order
// ----------------------------------------------------------
router.post("/", async (req, res) => {
  const { address, phone, payment_method } = req.body;
  const payMethod = payment_method || "Cash on Delivery";

  if (!address || !phone) {
    return res.status(400).json({ message: "Address and phone are required" });
  }

  try {
    // 1. get the cart items with restaurant_id
    const [cartItems] = await db.query(
      "SELECT c.quantity, f.id AS food_id, f.name, f.price, f.restaurant_id " +
        "FROM cart c JOIN food_items f ON c.food_id = f.id " +
        "WHERE c.user_id = ?",
      [req.user.id]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const groupedOrders = groupCartItemsByRestaurant(cartItems);

    if (groupedOrders.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const createdOrderIds = [];

    for (const group of groupedOrders) {
      const [orderResult] = await db.query(
        "INSERT INTO orders (user_id, restaurant_id, total_amount, address, phone, payment_method, status) " +
          "VALUES (?, ?, ?, ?, ?, ?, 'Pending')",
        [req.user.id, group.restaurant_id, group.total, address, phone, payMethod]
      );

      const orderId = orderResult.insertId;
      createdOrderIds.push(orderId);

      for (const item of group.items) {
        await db.query(
          "INSERT INTO order_items (order_id, food_id, food_name, price, quantity) VALUES (?, ?, ?, ?, ?)",
          [orderId, item.food_id, item.name, item.price, item.quantity]
        );
      }
    }

    await db.query("DELETE FROM cart WHERE user_id = ?", [req.user.id]);

    res.json({
      message: "Orders placed successfully",
      orderIds: createdOrderIds,
      orderId: createdOrderIds[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------------------
// GET /api/orders/my  -> order history of logged in user
// ----------------------------------------------------------
router.get("/my", async (req, res) => {
  try {
    const [orders] = await db.query(
      "SELECT o.*, r.name AS restaurant_name, r.address AS restaurant_address, " +
      "COALESCE(r.cuisines, r.cuisine, '') AS restaurant_cuisines " +
      "FROM orders o " +
      "LEFT JOIN restaurants r ON o.restaurant_id = r.id " +
      "WHERE o.user_id = ? ORDER BY o.id DESC",
      [req.user.id]
    );

    // attach the items of each order
    for (const order of orders) {
      const [items] = await db.query(
        "SELECT * FROM order_items WHERE order_id = ?",
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------------------
// GET /api/orders/all  -> returns orders with Customer and Restaurant details
// ----------------------------------------------------------
router.get("/all", async (req, res) => {
  try {
    const [rRows] = await db.query("SELECT id FROM restaurants WHERE user_id = ?", [req.user.id]);
    const isRestaurantOwner = rRows.length > 0;
    const restId = isRestaurantOwner ? rRows[0].id : (req.user.restaurant_id || 0);

    let sql =
      "SELECT o.*, " +
      "u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone_acc, " +
      "r.name AS restaurant_name, r.address AS restaurant_address, COALESCE(r.cuisines, r.cuisine, '') AS restaurant_cuisines " +
      "FROM orders o " +
      "LEFT JOIN users u ON o.user_id = u.id " +
      "LEFT JOIN restaurants r ON o.restaurant_id = r.id ";


    const params = [];

    // Filter by role scope
    if (["restaurant", "hotel"].includes(req.user.role) || isRestaurantOwner) {
      sql += "WHERE (o.restaurant_id = ? OR o.id IN (SELECT DISTINCT order_id FROM order_items oi JOIN food_items fi ON oi.food_id = fi.id WHERE fi.restaurant_id = ?)) ";
      params.push(restId, restId);
    } else if (!["admin", "superadmin"].includes(req.user.role)) {
      sql += "WHERE o.user_id = ? ";
      params.push(req.user.id);
    }

    sql += "ORDER BY o.id DESC";

    const [orders] = await db.query(sql, params);

    for (const order of orders) {
      const [items] = await db.query(
        "SELECT * FROM order_items WHERE order_id = ?",
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------------------
// PUT /api/orders/:id/cancel  -> customer cancels own pending order
// ----------------------------------------------------------
router.put("/:id/cancel", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM orders WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    const order = rows[0];
    if (order.user_id !== req.user.id && !["admin", "superadmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (order.status !== "Pending") {
      return res.status(400).json({ message: "Can only cancel orders that are Pending acceptance" });
    }

    await db.query("UPDATE orders SET status = 'Cancelled', cancelled_by = ? WHERE id = ?", [
      req.user.role,
      req.params.id,
    ]);
    res.json({ message: "Order cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------------------
router.put("/:id/report-problem", async (req, res) => {
  const { problem } = req.body;
  if (!problem) {
    return res.status(400).json({ message: "Problem description is required" });
  }

  try {
    await db.query("UPDATE orders SET problem_reported = ? WHERE id = ?", [
      problem,
      req.params.id,
    ]);
    res.json({ message: "Problem report logged for support" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------------------
// PUT /api/orders/:id/status  -> update order status
// ----------------------------------------------------------
router.put("/:id/status", async (req, res) => {
  try {
    const [rRows] = await db.query("SELECT id FROM restaurants WHERE user_id = ?", [req.user.id]);
    const isRestaurantOwner = rRows.length > 0;

    if (!["admin", "superadmin", "restaurant", "hotel", "customer"].includes(req.user.role) && !isRestaurantOwner) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status } = req.body;

    if (!STATUS_LIST.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await db.query("UPDATE orders SET status = ? WHERE id = ?", [
      status,
      req.params.id,
    ]);
    res.json({ message: `Order status updated to ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------------------------------------
// GET /api/orders/:id  -> single order details
// ----------------------------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM orders WHERE id = ?", [
      req.params.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = rows[0];

    if (!["admin", "superadmin", "restaurant", "hotel"].includes(req.user.role) && order.user_id !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const [items] = await db.query(
      "SELECT * FROM order_items WHERE order_id = ?",
      [order.id]
    );
    order.items = items;

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
