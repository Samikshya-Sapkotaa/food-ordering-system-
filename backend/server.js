// ==========================================================
// Foodie Corner – Backend Server (Hardened)
// Node.js + Express + MySQL
// ==========================================================

const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const morgan     = require("morgan");
const rateLimit  = require("express-rate-limit");
const path       = require("path");
require("dotenv").config();

const authRoutes       = require("./routes/auth");
const categoryRoutes   = require("./routes/categories");
const foodRoutes       = require("./routes/foods");
const cartRoutes       = require("./routes/cart");
const orderRoutes      = require("./routes/orders");
const restaurantRoutes = require("./routes/restaurants");
const reviewRoutes     = require("./routes/reviews");
const complaintRoutes  = require("./routes/complaints");

const app = express();

// ── Security headers ─────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // allow images from /uploads
}));

// ── CORS ─────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (e.g. curl, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// ── Request logging ───────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// ── Body parsers ──────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Rate limiting ─────────────────────────────────────────────
// Strict limit for auth routes (login / register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // max 20 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});

// General API limiter (less strict)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 minute
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Rate limit exceeded. Please slow down." },
});

app.use("/api/auth/login",    authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/",              apiLimiter);

// ── Static file serving ───────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Health check ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Foodie Corner API",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ────────────────────────────────────────────────────
app.use("/api/auth",        authRoutes);
app.use("/api/categories",  categoryRoutes);
app.use("/api/foods",       foodRoutes);
app.use("/api/cart",        cartRoutes);
app.use("/api/orders",      orderRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/reviews",     reviewRoutes);
app.use("/api/complaints",  complaintRoutes);

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Global error handler ──────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message);
  // Don't leak stack trace in production
  const isDev = process.env.NODE_ENV !== "production";
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(isDev && { stack: err.stack }),
  });
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅  Foodie Corner API running at http://localhost:${PORT}`);
  console.log(`🛡️  Helmet + CORS + Rate-Limit active`);
});
