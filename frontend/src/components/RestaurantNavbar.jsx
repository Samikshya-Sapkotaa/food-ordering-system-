import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

function RestaurantNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [restName, setRestName] = useState("");

  useEffect(() => {
    api
      .get("/restaurants/my")
      .then((res) => {
        if (res.data?.name) setRestName(res.data.name);
      })
      .catch(() => {});
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function active(path) {
    return location.pathname === path ? "active" : "";
  }

  const displayName = restName || user?.name || "Restaurant Partner";

  return (
    <header className="restaurant-navbar-wrap" style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", color: "#fff" }}>
      <div className="navbar-container">
        <Link to="/restaurant" className="logo" style={{ color: "#f97316" }}>
          <span className="logo-icon">🍳</span>
          Restaurant Panel
        </Link>

        <nav className="nav-links nav-links-open">
          <Link to="/restaurant" className={`nav-link ${active("/restaurant")}`} style={{ color: "#cbd5e1" }}>
            📊 Dashboard
          </Link>
          <Link to="/restaurant/orders" className={`nav-link ${active("/restaurant/orders")}`} style={{ color: "#cbd5e1" }}>
            🛎️ Orders
          </Link>
          <Link to="/restaurant/menu" className={`nav-link ${active("/restaurant/menu")}`} style={{ color: "#cbd5e1" }}>
            📖 Menu Mgmt
          </Link>
          <Link to="/restaurant/categories" className={`nav-link ${active("/restaurant/categories")}`} style={{ color: "#cbd5e1" }}>
            🗂️ Categories
          </Link>
          <Link to="/restaurant/profile" className={`nav-link ${active("/restaurant/profile")}`} style={{ color: "#cbd5e1" }}>
            🏪 Profile
          </Link>
          <Link to="/restaurant/earnings" className={`nav-link ${active("/restaurant/earnings")}`} style={{ color: "#cbd5e1" }}>
            💰 Earnings
          </Link>

          <div className="nav-user-chip" style={{ background: "rgba(255,255,255,0.12)", color: "#fff", padding: "6px 12px", borderRadius: "20px" }}>
            <span className="nav-user-avatar">🏪</span>
            <span className="username" style={{ color: "#f8fafc", fontWeight: "700", fontSize: "13px" }}>
              {displayName}
            </span>
            <button className="logout-btn" onClick={handleLogout} style={{ marginLeft: "8px" }}>Logout</button>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default RestaurantNavbar;
