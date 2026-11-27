// Food item routes — with local image upload support via multer
const express  = require("express");
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");
const db       = require("../config/db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const UPLOAD_URL = "http://localhost:5000/uploads/";

function sanitizeFoodImage(item) {
  if (!item || !item.image) return item;

  if (item.image.startsWith("http")) {
    return item;
  }

  const filename = path.basename(item.image);
  const uploadPath = path.join(__dirname, "..", "uploads", filename);
  if (!fs.existsSync(uploadPath)) {
    item.image = null;
  } else {
    item.image = `${UPLOAD_URL}${filename}`;
  }

  return item;
}

const router = express.Router();

// ── Multer setup ─────────────────────────────────────────────
// Saves files to backend/uploads/ with a timestamp-based unique name
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const safe = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, "_").toLowerCase();
    cb(null, `${safe}_${Date.now()}${ext}`);
  },
});

const ALLOWED = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const upload  = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED.includes(ext)) return cb(null, true);
    cb(new Error("Only image files are allowed (jpg, png, webp, gif)"));
  },
});

// ── Helper: delete old image file when replaced ───────────────
function deleteOldImage(filename) {
  if (!filename) return;
  const oldPath = path.join(__dirname, "..", "uploads", path.basename(filename));
  if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
}

// GET /api/foods  (public - customer menu, available only)
router.get("/", async (req, res) => {
  const categoryId = req.query.category;
  const restaurantId = req.query.restaurant_id || req.query.restaurant;

  try {
    let sql =
      "SELECT f.*, c.name AS category_name, r.name AS restaurant_name, " +
      "COALESCE(f.image, f.image_url, '') AS image " +
      "FROM food_items f " +
      "LEFT JOIN categories c ON f.category_id = c.id " +
      "LEFT JOIN restaurants r ON f.restaurant_id = r.id " +
      "WHERE f.is_available = 1";
    let values = [];

    if (categoryId) { sql += " AND f.category_id = ?"; values.push(categoryId); }
    if (restaurantId) { sql += " AND f.restaurant_id = ?"; values.push(restaurantId); }

    sql += " ORDER BY f.id DESC";
    const [rows] = await db.query(sql, values);
    rows.forEach(sanitizeFoodImage);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/foods/all  (restaurant manager sees ONLY their own kitchen items; admin sees all)
router.get("/all", verifyToken, async (req, res) => {
  try {
    const [rRows] = await db.query("SELECT id FROM restaurants WHERE user_id = ?", [req.user.id]);
    const isRestaurantOwner = rRows.length > 0;
    let restId = isRestaurantOwner ? rRows[0].id : (req.user.restaurant_id || 0);

    if (!["admin", "superadmin", "restaurant", "hotel"].includes(req.user.role) && !isRestaurantOwner) {
      return res.status(403).json({ message: "Access denied" });
    }

    let sql =
      "SELECT f.*, c.name AS category_name, r.name AS restaurant_name, " +
      "COALESCE(f.image, f.image_url, '') AS image " +
      "FROM food_items f " +
      "LEFT JOIN categories c ON f.category_id = c.id " +
      "LEFT JOIN restaurants r ON f.restaurant_id = r.id ";
    
    const params = [];

    // If user is a restaurant owner, restrict to their specific restaurant
    if (["restaurant", "hotel"].includes(req.user.role) || isRestaurantOwner) {
      sql += "WHERE f.restaurant_id = ? ";
      params.push(restId);
    } else if (req.query.restaurant_id) {
      sql += "WHERE f.restaurant_id = ? ";
      params.push(req.query.restaurant_id);
    }

    sql += "ORDER BY f.id DESC";

    const [rows] = await db.query(sql, params);
    rows.forEach(sanitizeFoodImage);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/foods  (restaurant manager or admin — multipart/form-data)
router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  const { category_id, name, description, price, is_available, restaurant_id } = req.body;

  if (!category_id || !name || !price) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: "Category, name and price are required" });
  }

  const image = req.file ? req.file.filename : null;

  try {
    let targetRestaurantId = restaurant_id;
    if (!targetRestaurantId) {
      const [rRows] = await db.query("SELECT id FROM restaurants WHERE user_id = ?", [req.user.id]);
      if (rRows.length > 0) targetRestaurantId = rRows[0].id;
    }
    if (!targetRestaurantId) targetRestaurantId = 1;

    const availVal = (is_available === "false" || is_available === false || is_available === 0 || is_available === "0") ? 0 : 1;
    await db.query(
      "INSERT INTO food_items (category_id, restaurant_id, name, description, price, is_available, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [category_id, targetRestaurantId, name, description || "", price, availVal, image]
    );
    res.json({ message: "Food item added to kitchen menu" });
  } catch (err) {
    console.error(err);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/foods/:id  (admin only — multipart/form-data)
router.put("/:id", verifyToken, verifyAdmin, upload.single("image"), async (req, res) => {
  const { category_id, name, description, price, is_available } = req.body;

  if (!category_id || !name || !price) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: "Category, name and price are required" });
  }

  try {
    // fetch current image so we can delete it if replaced
    const [[existing]] = await db.query("SELECT image FROM food_items WHERE id = ?", [req.params.id]);

    let image = existing?.image ?? null; // keep existing by default
    if (req.file) {
      deleteOldImage(existing?.image);  // remove old file
      image = req.file.filename;
    }

    const availVal = (is_available === "false" || is_available === false || is_available === 0 || is_available === "0") ? 0 : 1;
    await db.query(
      "UPDATE food_items SET category_id = ?, name = ?, description = ?, price = ?, is_available = ?, image = ? WHERE id = ?",
      [category_id, name, description || "", price, availVal, image, req.params.id]
    );
    res.json({ message: "Food item updated" });
  } catch (err) {
    console.error(err);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/foods/:id/availability  (admin OR restaurant owner — quick toggle)
router.put("/:id/availability", verifyToken, async (req, res) => {
  try {
    // If a specific value is sent, use it; otherwise toggle
    if (req.body.is_available !== undefined) {
      const val = (req.body.is_available === true || req.body.is_available === 1 || req.body.is_available === "1" || req.body.is_available === "true") ? 1 : 0;
      await db.query("UPDATE food_items SET is_available = ? WHERE id = ?", [val, req.params.id]);
      res.json({ message: val ? "Marked In Stock" : "Marked Out of Stock" });
    } else {
      await db.query("UPDATE food_items SET is_available = NOT is_available WHERE id = ?", [req.params.id]);
      res.json({ message: "Availability toggled" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/foods/:id  (admin only)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    // also delete the image file
    const [[row]] = await db.query("SELECT image FROM food_items WHERE id = ?", [req.params.id]);
    if (row?.image) deleteOldImage(row.image);
    await db.query("DELETE FROM food_items WHERE id = ?", [req.params.id]);
    res.json({ message: "Food item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
