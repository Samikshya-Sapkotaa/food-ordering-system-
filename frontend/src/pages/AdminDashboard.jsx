import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import Loader from "../components/Loader";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeOrders: 0,
    deliveredOrders: 0,
    totalFoods: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalRestaurants: 0,
    pendingRestaurants: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentFoods, setRecentFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      let restData = [];
      try {
        const rRes = await api.get("/restaurants/all");
        restData = Array.isArray(rRes.data) && rRes.data.length > 0 ? rRes.data : (await api.get("/restaurants")).data || [];
      } catch (err) {
        const rRes = await api.get("/restaurants").catch(() => ({ data: [] }));
        restData = rRes.data || [];
      }

      const [ordersRes, foodsRes, catsRes, usersRes] = await Promise.all([
        api.get("/orders/all").catch(() => ({ data: [] })),
        api.get("/foods/all").catch(() => ({ data: [] })),
        api.get("/categories").catch(() => ({ data: [] })),
        api.get("/auth/users").catch(() => ({ data: [] })),
      ]);

      const orders = ordersRes.data || [];
      const foods = foodsRes.data || [];
      const cats = catsRes.data || [];
      const users = usersRes.data || [];
      const restaurants = restData || [];

      const totalRevenue = orders
        .filter((o) => o.status !== "Cancelled")
        .reduce((sum, o) => sum + Number(o.total_amount), 0);

      const activeOrders = orders.filter((o) => !["Delivered", "Cancelled"].includes(o.status)).length;
      const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;
      const pendingRestaurants = restaurants.filter((r) => r.is_approved === 0).length;

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        activeOrders,
        deliveredOrders,
        totalFoods: foods.length,
        totalCategories: cats.length,
        totalUsers: users.length,
        totalRestaurants: restaurants.length,
        pendingRestaurants,
      });

      setRecentOrders(orders.slice(0, 5));
      setRecentFoods(foods.slice(0, 6));
    } catch (err) {
    }
    setLoading(false);
  }

  if (loading) return <Loader text="Loading Admin Executive Dashboard…" />;

  return (
    <div className="ad-page">

      {/* ── ADMIN DASHBOARD HEADER ──────────────────────────── */}
      <div className="ad-header">
        <div className="ad-header-left">
          <span className="ad-header-icon">👑</span>
          <div>
            <h2 className="ad-title">Admin Executive Control Panel</h2>
            <p className="ad-sub">Real-time revenue metrics, menu inventory, orders & user statistics across Kathmandu</p>
          </div>
        </div>

        <div className="ad-header-actions">
          <Link to="/admin/foods" className="ad-btn primary">
            + New Food Item
          </Link>
          <Link to="/admin/orders" className="ad-btn secondary">
            📦 Manage Orders
          </Link>
        </div>
      </div>

      {/* ── ANALYTICS METRICS CARDS GRID ────────────────────── */}
      <div className="ad-metrics-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>

        {/* Total Restaurants Metric */}
        <div className="ad-metric-card" style={{ borderLeft: "4px solid #f97316" }}>
          <div className="ad-metric-top">
            <span className="ad-metric-icon">🏪</span>
            <span className="ad-metric-badge" style={{ background: stats.pendingRestaurants > 0 ? "#fff7ed" : "#dcfce7", color: stats.pendingRestaurants > 0 ? "#c2410c" : "#15803d" }}>
              {stats.pendingRestaurants > 0 ? `${stats.pendingRestaurants} Pending Review` : "100% Active"}
            </span>
          </div>
          <span className="ad-metric-val">{stats.totalRestaurants}</span>
          <span className="ad-metric-label">Total Registered Restaurants</span>
        </div>

        {/* Revenue Metric */}
        <div className="ad-metric-card revenue">
          <div className="ad-metric-top">
            <span className="ad-metric-icon">💰</span>
            <span className="ad-metric-badge green">+100% Live</span>
          </div>
          <span className="ad-metric-val">Rs. {stats.totalRevenue.toFixed(0)}</span>
          <span className="ad-metric-label">Total Platform Revenue</span>
        </div>

        {/* Total Orders Metric */}
        <div className="ad-metric-card orders">
          <div className="ad-metric-top">
            <span className="ad-metric-icon">📦</span>
            <span className="ad-metric-badge blue">{stats.activeOrders} Active</span>
          </div>
          <span className="ad-metric-val">{stats.totalOrders}</span>
          <span className="ad-metric-label">Total Customer Orders</span>
        </div>

        {/* Food Items Metric */}
        <div className="ad-metric-card foods">
          <div className="ad-metric-top">
            <span className="ad-metric-icon">🍱</span>
            <span className="ad-metric-badge amber">{stats.totalCategories} Categories</span>
          </div>
          <span className="ad-metric-val">{stats.totalFoods}</span>
          <span className="ad-metric-label">Menu Food Items</span>
        </div>

        {/* System Users Metric */}
        <div className="ad-metric-card users">
          <div className="ad-metric-top">
            <span className="ad-metric-icon">👥</span>
            <span className="ad-metric-badge purple">Registered Users</span>
          </div>
          <span className="ad-metric-val">{stats.totalUsers}</span>
          <span className="ad-metric-label">Registered Accounts</span>
        </div>

      </div>

      {/* ── QUICK MANAGEMENT NAVIGATION TILES ───────────────── */}
      <div className="ad-tiles-grid" style={{ marginTop: "24px" }}>
        <Link to="/admin/restaurants" className="ad-tile-card">
          <div className="ad-tile-icon">🏪</div>
          <div className="ad-tile-info">
            <h4>Restaurant Partners ({stats.totalRestaurants})</h4>
            <p>Approve applications, view registered partners, toggle active status</p>
          </div>
          <span className="ad-tile-arrow">→</span>
        </Link>

        <Link to="/admin/complaints" className="ad-tile-card">
          <div className="ad-tile-icon">🚨</div>
          <div className="ad-tile-info">
            <h4>Complaints & Support</h4>
            <p>View customer issue tickets, track disputes, mark resolved</p>
          </div>
          <span className="ad-tile-arrow">→</span>
        </Link>

        <Link to="/admin/users" className="ad-tile-card">
          <div className="ad-tile-icon">👑</div>
          <div className="ad-tile-info">
            <h4>Manage User Accounts</h4>
            <p>View, assign roles (Customer, Restaurant, Admin), block/unblock accounts</p>
          </div>
          <span className="ad-tile-arrow">→</span>
        </Link>

        <Link to="/admin/foods" className="ad-tile-card">
          <div className="ad-tile-icon">🍱</div>
          <div className="ad-tile-info">
            <h4>Manage Food Inventory</h4>
            <p>Upload photos, set prices, edit descriptions, toggle availability</p>
          </div>
          <span className="ad-tile-arrow">→</span>
        </Link>

        <Link to="/admin/orders" className="ad-tile-card">
          <div className="ad-tile-icon">🗃️</div>
          <div className="ad-tile-info">
            <h4>Customer Orders History</h4>
            <p>View all order status updates, total amounts & items breakdown</p>
          </div>
          <span className="ad-tile-arrow">→</span>
        </Link>
      </div>

    </div>
  );
}

export default AdminDashboard;
