import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = user && ["admin", "superadmin"].includes(user.role);
  const isCustomer = user && user.role === "customer";

  useEffect(() => {
    if (isCustomer) fetchCartCount();
  }, [user, location.pathname]);

  async function fetchCartCount() {
    try {
      const res = await api.get("/cart");
      const qty = res.data.items?.reduce((s, i) => s + i.quantity, 0) || 0;
      setCartCount(qty);
    } catch {}
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function active(path) {
    return location.pathname === path ? "active" : "";
  }

  return (
    <header className="navbar-wrap">
      <div className="navbar-container">

        {/* Brand */}
        <Link to="/" className="logo">
          <span className="logo-icon">🍕</span>
          Foodie Corner
        </Link>

        {/* Hamburger (mobile) */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav className={`nav-links${menuOpen ? " nav-links-open" : ""}`}>

          {/* Always visible */}
          <Link to="/" className={`nav-link ${active("/")}`}>🏠 Home</Link>
          <Link to="/menu" className={`nav-link ${active("/menu")}`}>🍽️ Menu</Link>

          {/* Customer links */}
          {isCustomer && (
            <>
              <Link to="/cart" className={`nav-link nav-cart-link ${active("/cart")}`}>
                🛒 Cart
                {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
              </Link>
              <Link to="/orders" className={`nav-link ${active("/orders")}`}>📦 My Orders</Link>
              <Link to="/support" className={`nav-link ${active("/support")}`}>💬 Help</Link>
            </>
          )}

          {/* Restaurant link */}
          {user?.role === "restaurant" && (
            <Link to="/restaurant" className={`nav-link ${active("/restaurant")}`}>🍳 Restaurant Panel</Link>
          )}

          {/* Admin links */}
          {isAdmin && (
            <>
              <Link to="/admin"            className={`nav-link ${active("/admin")}`}>📊 Dashboard</Link>
              <Link to="/admin/restaurants" className={`nav-link ${active("/admin/restaurants")}`}>🏪 Partners</Link>
              <Link to="/admin/foods"      className={`nav-link ${active("/admin/foods")}`}>🍱 Foods</Link>
              <Link to="/admin/orders"     className={`nav-link ${active("/admin/orders")}`}>🗃️ Orders</Link>
              <Link to="/admin/users"      className={`nav-link ${active("/admin/users")}`}>👑 Users</Link>
              <Link to="/admin/complaints" className={`nav-link ${active("/admin/complaints")}`}>🚨 Support</Link>
            </>
          )}

          {/* Logged out */}
          {!user && (
            <>
              <Link to="/login"    className={`nav-link ${active("/login")}`}>Sign In</Link>
              <Link to="/register" className="nav-register-btn">Register</Link>
            </>
          )}

          {/* User chip */}
          {user && (
            <div className="nav-user-chip">
              <span className="nav-user-avatar">
                {isAdmin ? "👑" : "👤"}
              </span>
              <span className="username">
                Hi, {user.name?.split(" ")[0]} ({user.role.toUpperCase()})
              </span>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
