const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../config/db");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const UPLOAD_URL = "http://localhost:5000/uploads/";

function sanitizeRestaurantImage(item) {
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

// Multer storage setup for restaurant photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safe = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, "_").toLowerCase();
    cb(null, `rest_${safe}_${Date.now()}${ext}`);
  },
});

const ALLOWED = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED.includes(ext)) return cb(null, true);
    cb(new Error("Only image files are allowed (jpg, png, webp, gif)"));
  },
});

// Helper: check restaurant role
function verifyRestaurant(req, res, next) {
  if (!["restaurant", "admin", "superadmin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Restaurant access only" });
  }
  next();
}

// GET /api/restaurants — public list of approved restaurants
router.get("/", async (req, res) => {
  const { search, cuisine, vegOnly, sortBy } = req.query;

  try {
    let sql =
      "SELECT DISTINCT r.*, COALESCE(r.image, r.image_url, '') AS image FROM restaurants r " +
      "LEFT JOIN food_items f ON f.restaurant_id = r.id " +
      "WHERE r.is_approved = 1 AND r.is_active = 1";
    const params = [];

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      sql += " AND (r.name LIKE ? OR r.cuisines LIKE ? OR r.cuisine LIKE ? OR r.address LIKE ? OR f.name LIKE ? OR f.description LIKE ?)";
      params.push(q, q, q, q, q, q);
    }

    if (cuisine && cuisine !== "all") {
      sql += " AND (r.cuisines LIKE ? OR r.cuisine LIKE ?)";
      params.push(`%${cuisine}%`, `%${cuisine}%`);
    }

    if (vegOnly === "true" || vegOnly === true) {
      sql += " AND r.is_veg_only = 1";
    }

    if (sortBy === "delivery_time") {
      sql += " ORDER BY r.delivery_time ASC";
    } else if (sortBy === "price_low") {
      sql += " ORDER BY r.price_for_two ASC";
    } else {
      sql += " ORDER BY r.rating DESC";
    }

    const [rows] = await db.query(sql, params);
    rows.forEach(sanitizeRestaurantImage);
    res.json(rows);
  } catch (err) {
    console.error("[restaurants GET all]", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/restaurants/all — admin: all restaurants including pending
router.get("/all", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, COALESCE(r.image, r.image_url, '') AS image, u.name AS owner_name, u.email AS owner_email
       FROM restaurants r
       LEFT JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC`
    );
    rows.forEach(sanitizeRestaurantImage);
    res.json(rows);
  } catch (err) {
    console.error("[restaurants GET admin all]", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/restaurants/my — restaurant user gets their own profile (auto-creates if missing)
router.get("/my", verifyToken, async (req, res) => {
  try {
    let [rows] = await db.query(
      "SELECT *, COALESCE(image, image_url, '') AS image FROM restaurants WHERE user_id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      // Get user details to auto-create profile
      const [uRows] = await db.query("SELECT * FROM users WHERE id = ?", [req.user.id]);
      if (uRows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      const u = uRows[0];

      const defaultName = u.name || "My Restaurant";
      const defaultAddr = u.address || "Kathmandu, Nepal";
      const defaultPhone = u.phone || "";

      const [insRes] = await db.query(
        "INSERT INTO restaurants (user_id, name, address, phone, cuisines, cuisine, is_approved, is_active) VALUES (?, ?, ?, ?, 'Nepali, Fast Food', 'Nepali, Fast Food', 1, 1)",
        [req.user.id, defaultName, defaultAddr, defaultPhone]
      );

      const [newRows] = await db.query("SELECT * FROM restaurants WHERE id = ?", [insRes.insertId]);
      rows = newRows;
    }

    const item = rows[0];
    sanitizeRestaurantImage(item);
    item.cuisine = item.cuisines || item.cuisine || "";
    item.cuisines = item.cuisine;
    res.json(item);
  } catch (err) {
    console.error("[restaurants GET my]", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/restaurants/:id — single restaurant details
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT *, COALESCE(image, image_url, '') AS image FROM restaurants WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Not found" });
    const item = rows[0];
    sanitizeRestaurantImage(item);
    res.json(item);
  } catch (err) {
    console.error("[restaurants GET one]", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/restaurants — admin registers new restaurant
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  const { user_id, name, address, phone, cuisine, cuisines } = req.body;
  const cuisineVal = cuisines || cuisine || "";

  try {
    const [result] = await db.query(
      "INSERT INTO restaurants (user_id, name, address, phone, cuisines, cuisine, is_approved, is_active) VALUES (?, ?, ?, ?, ?, ?, 1, 1)",
      [user_id, name, address, phone, cuisineVal, cuisineVal]
    );
    res.json({ message: "Restaurant partner registered successfully", id: result.insertId });
  } catch (err) {
    console.error("[restaurants POST]", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/restaurants/my — restaurant updates own profile & KYC documents
router.put("/my", verifyToken, upload.fields([{ name: "image", maxCount: 1 }, { name: "kyc_document", maxCount: 1 }]), async (req, res) => {
  if (!["restaurant", "admin", "superadmin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }

  const {
    name, description, address, phone, cuisine, cuisines,
    opening_time, closing_time, price_for_two, delivery_time, offer_text,
    pan_number, dftqc_license, vat_number
  } = req.body;

  const cuisineVal = cuisines || cuisine || "";
  let imageFilename = req.files?.image ? req.files.image[0].filename : null;
  let kycFilename = req.files?.kyc_document ? req.files.kyc_document[0].filename : null;

  try {
    const [existing] = await db.query("SELECT image, kyc_document FROM restaurants WHERE user_id = ?", [req.user.id]);
    
    if (existing.length === 0) {
      await db.query(
        "INSERT INTO restaurants (user_id, name, description, address, phone, cuisines, cuisine, price_for_two, delivery_time, offer_text, opening_time, closing_time, pan_number, dftqc_license, vat_number, image, kyc_document, is_approved, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)",
        [
          req.user.id, name || "My Restaurant", description || "", address || "", phone || "",
          cuisineVal, cuisineVal, price_for_two || 400, delivery_time || "20-25 min", offer_text || "",
          opening_time || "09:00", closing_time || "22:00", pan_number || null, dftqc_license || null, vat_number || null, imageFilename, kycFilename
        ]
      );
    } else {
      if (!imageFilename) imageFilename = existing[0].image;
      if (!kycFilename) kycFilename = existing[0].kyc_document;

      await db.query(
        "UPDATE restaurants SET name=?, description=?, address=?, phone=?, cuisines=?, cuisine=?, price_for_two=?, delivery_time=?, offer_text=?, opening_time=?, closing_time=?, pan_number=?, dftqc_license=?, vat_number=?, image=?, kyc_document=? WHERE user_id=?",
        [
          name, description, address, phone, cuisineVal, cuisineVal,
          price_for_two || 400, delivery_time || "20-25 min", offer_text || "",
          opening_time || "09:00", closing_time || "22:00", pan_number || null, dftqc_license || null, vat_number || null, imageFilename, kycFilename, req.user.id
        ]
      );

      // Keep user account name in sync with restaurant name
      if (name && name.trim()) {
        await db.query("UPDATE users SET name = ? WHERE id = ?", [name.trim(), req.user.id]);
      }
    }

    res.json({ message: "Profile & KYC documents updated successfully", image: imageFilename, kyc_document: kycFilename });
  } catch (err) {
    console.error("[restaurants PUT my]", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/restaurants/:id/approve — admin approves/rejects
router.put("/:id/approve", verifyToken, verifyAdmin, async (req, res) => {
  const { is_approved } = req.body; // 1 = approved, 2 = rejected
  try {
    await db.query("UPDATE restaurants SET is_approved = ? WHERE id = ?", [is_approved, req.params.id]);
    res.json({ message: is_approved === 1 ? "Restaurant approved" : "Restaurant rejected" });
  } catch (err) {
    console.error("[restaurants PUT approve]", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/restaurants/:id/toggle — admin activate/deactivate
router.put("/:id/toggle", verifyToken, verifyAdmin, async (req, res) => {
  try {
    await db.query("UPDATE restaurants SET is_active = NOT is_active WHERE id = ?", [req.params.id]);
    res.json({ message: "Restaurant status toggled" });
  } catch (err) {
    console.error("[restaurants PUT toggle]", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/restaurants/:id — admin delete restaurant partner
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const restaurantId = req.params.id;

    // Remove any menu items linked to the restaurant to avoid orphaned food items.
    await db.query("DELETE FROM food_items WHERE restaurant_id = ?", [restaurantId]);

    // Null out orders that reference this restaurant to preserve order history.
    await db.query("UPDATE orders SET restaurant_id = NULL WHERE restaurant_id = ?", [restaurantId]);

    const [result] = await db.query("DELETE FROM restaurants WHERE id = ?", [restaurantId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json({ message: "Restaurant deleted successfully" });
  } catch (err) {
    console.error("[restaurants DELETE]", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
