import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCustomer } from "../../context/CustomerContext";

function FoodieTopNav({ activePage, onNavigate }) {
  const { cart, setCartOpen, addresses, selectedAddressId, setSelectedAddressId, addAddress } = useCustomer();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newAddrText, setNewAddrText] = useState("");
  const [newAddrType, setNewAddrType] = useState("Home");

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const displayName = user ? (user.name || user.username || user.email?.split("@")[0] || "Account") : "Account";
  const initials = displayName.charAt(0).toUpperCase();

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const activeAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newAddrText.trim()) return;
    addAddress(newAddrType, newAddrText);
    setNewAddrText("");
    setShowAddressModal(false);
  };

  return (
    <header className="fc-topnav">
      <div className="fc-topnav-container">
        {/* Brand Logo */}
        <button onClick={() => { onNavigate("home"); setMobileMenuOpen(false); }} className="fc-brand-logo">
          <span>🍕</span>
          <span>Foodie Corner</span>
        </button>

        {/* Location Selector */}
        <button className="fc-location-picker" onClick={() => setShowAddressModal(true)}>
          <span style={{ color: "#ea580c" }}>📍</span>
          <span style={{ fontWeight: "800", color: "#0f172a" }}>{activeAddress?.type || "Location"}</span>
          <span style={{ color: "#64748b", fontWeight: "500", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {activeAddress?.text?.slice(0, 22)}...
          </span>
          <span style={{ color: "#94a3b8", fontSize: "12px" }}>▾</span>
        </button>

        {/* Global Search Bar (hidden on mobile) */}
        <div className="fc-nav-search">
          <span className="fc-search-icon">🔍</span>
          <input
            type="text"
            className="fc-search-input"
            placeholder="Search restaurants, momos, biryani, desserts..."
          />
        </div>

        {/* Action Links (desktop) */}
        <div className="fc-nav-actions fc-nav-actions-desktop">
          <button className="fc-nav-link" onClick={() => onNavigate("history")}>
            <span>📜</span>
            <span>Orders</span>
          </button>

          
          <button className="fc-nav-link" onClick={() => onNavigate("support")}>
            <span>💬</span>
            <span>Help</span>
          </button>

          {/* Cart Button with Live Counter */}
          <button className="fc-cart-btn" onClick={() => setCartOpen(true)}>
            <span>🛒 Cart</span>
            {totalCartCount > 0 && <span className="fc-cart-badge">{totalCartCount}</span>}
          </button>

          {/* Admin Panel shortcut — only for admin/superadmin */}
          {(user?.role === "admin" || user?.role === "superadmin") && (
            <button
              onClick={() => navigate("/admin")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
                border: "none",
                borderRadius: "10px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "800",
                color: "#ffffff",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(37,99,235,0.35)",
                transition: "all 0.18s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,99,235,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(37,99,235,0.35)"; }}
            >
              📊 Admin Panel
            </button>
          )}

          {/* Profile Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              className="fc-nav-link"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #ea580c, #c2410c)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "900",
                  fontSize: "14px",
                  flexShrink: 0
                }}
              >
                {initials}
              </div>
              <span style={{ fontWeight: "700" }}>{displayName} ▾</span>
            </button>

            {showProfileDropdown && (
              <>
                {/* Backdrop */}
                <div
                  style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 599 }}
                  onClick={() => setShowProfileDropdown(false)}
                />
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "46px",
                    background: "#ffffff",
                    borderRadius: "14px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                    border: "1px solid #e2e8f0",
                    width: "210px",
                    padding: "8px",
                    zIndex: 600
                  }}
                >
                  {/* User Info Header */}
                  <div style={{ padding: "10px 14px 12px", borderBottom: "1px solid #f1f5f9", marginBottom: "4px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>{displayName}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                      {user?.role === "admin" || user?.role === "superadmin" ? "Foodie Corner Admin" : "Foodie Corner Customer"}
                    </div>
                  </div>

                  {/* Admin Panel shortcut for admin users */}
                  {(user?.role === "admin" || user?.role === "superadmin") && (
                    <>
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          navigate("/admin");
                        }}
                        style={{
                          width: "100%",
                          padding: "9px 14px",
                          textAlign: "left",
                          background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
                          border: "none",
                          fontSize: "13px",
                          fontWeight: "800",
                          cursor: "pointer",
                          color: "#ffffff",
                          borderRadius: "8px",
                          fontFamily: "inherit",
                          marginBottom: "4px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                      >
                        📊 Admin Dashboard
                      </button>
                      <div style={{ borderBottom: "1px solid #f1f5f9", marginBottom: "4px" }} />
                    </>
                  )}

                  {/* Nav Links */}
                  {[
                    { label: "👤 My Profile", page: "profile" },
                    { label: "📍 Addresses", page: "profile" },
                    { label: "📜 Past Orders", page: "history" },
                    { label: "💬 Support", page: "support" }
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        onNavigate(item.page);
                        setShowProfileDropdown(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "9px 14px",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        fontSize: "13px",
                        fontWeight: "700",
                        cursor: "pointer",
                        color: "#334155",
                        borderRadius: "8px",
                        fontFamily: "inherit"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                    >
                      {item.label}
                    </button>
                  ))}

                  {/* Sign Out */}
                  <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "4px", paddingTop: "4px" }}>
                    <button
                      onClick={() => { setShowProfileDropdown(false); handleSignOut(); }}
                      style={{
                        width: "100%",
                        padding: "9px 14px",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        fontSize: "13px",
                        fontWeight: "800",
                        cursor: "pointer",
                        color: "#dc2626",
                        borderRadius: "8px",
                        fontFamily: "inherit",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Hamburger button (mobile only) ── */}
        <div style={{ display: "none" }} className="fc-mobile-actions">
          {/* Cart icon always visible */}
          <button
            className="fc-cart-btn"
            onClick={() => setCartOpen(true)}
            style={{ position: "relative", background: "none", border: "none", cursor: "pointer", fontSize: "22px", padding: "4px" }}
          >
            🛒
            {totalCartCount > 0 && (
              <span style={{ position: "absolute", top: "-4px", right: "-6px", background: "#ea580c", color: "#fff", fontSize: "10px", fontWeight: "900", width: "16px", height: "16px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", padding: "4px", color: "#0f172a" }}
            aria-label="Menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* ── Mobile slide-down menu ── */}
      {mobileMenuOpen && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 900,
          background: "#ffffff", borderBottom: "1px solid #e2e8f0",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          padding: "16px 16px 20px",
          display: "flex", flexDirection: "column", gap: "4px"
        }}>
          {/* Mobile search */}
          <div style={{ position: "relative", marginBottom: "12px" }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>🔍</span>
            <input
              type="text"
              placeholder="Search restaurants or dishes..."
              style={{ width: "100%", padding: "10px 12px 10px 34px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", outline: "none", background: "#f8fafc" }}
            />
          </div>

          {[
            { icon: "🏠", label: "Home",          page: "home" },
            { icon: "📜", label: "My Orders",     page: "history" },
            { icon: "💬", label: "Help & Support", page: "support" },
            { icon: "👤", label: "My Profile",     page: "profile" },
          ].map((item) => (
            <button
              key={item.page}
              onClick={() => { onNavigate(item.page); setMobileMenuOpen(false); }}
              style={{
                width: "100%", padding: "12px 16px", background: "none",
                border: "none", borderRadius: "10px", fontSize: "14px",
                fontWeight: "700", color: "#0f172a", textAlign: "left",
                cursor: "pointer", display: "flex", alignItems: "center",
                gap: "12px", fontFamily: "inherit"
              }}
            >
              <span style={{ fontSize: "18px" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          {/* Admin Panel link for admin users */}
          {(user?.role === "admin" || user?.role === "superadmin") && (
            <button
              onClick={() => { setMobileMenuOpen(false); navigate("/admin"); }}
              style={{
                width: "100%", padding: "12px 16px",
                background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
                border: "none", borderRadius: "10px", fontSize: "14px",
                fontWeight: "800", color: "#ffffff", textAlign: "left",
                cursor: "pointer", display: "flex", alignItems: "center",
                gap: "12px", fontFamily: "inherit"
              }}
            >
              <span style={{ fontSize: "18px" }}>📊</span>
              Admin Dashboard
            </button>
          )}

          <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "8px", paddingTop: "8px" }}>
            <button
              onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
              style={{
                width: "100%", padding: "12px 16px", background: "#fef2f2",
                border: "none", borderRadius: "10px", fontSize: "14px",
                fontWeight: "800", color: "#dc2626", textAlign: "left",
                cursor: "pointer", display: "flex", alignItems: "center",
                gap: "12px", fontFamily: "inherit"
              }}
            >
              <span style={{ fontSize: "18px" }}>🚪</span> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Address Selection & Add Modal */}
      {showAddressModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={() => setShowAddressModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "28px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 24px 50px rgba(0,0,0,0.2)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "18px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "900", margin: 0, color: "#0f172a" }}>
                📍 Select Delivery Address
              </h3>
              <button onClick={() => setShowAddressModal(false)} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              {addresses.map((a) => (
                <div
                  key={a.id}
                  onClick={() => {
                    setSelectedAddressId(a.id);
                    setShowAddressModal(false);
                  }}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    border: "2px solid",
                    borderColor: selectedAddressId === a.id ? "#ea580c" : "#e2e8f0",
                    background: selectedAddressId === a.id ? "#fff7ed" : "#f8fafc",
                    cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                >
                  <strong style={{ fontSize: "14px", color: "#0f172a" }}>
                    {selectedAddressId === a.id && <span style={{ color: "#ea580c" }}>✓ </span>}
                    {a.type}
                    {a.isDefault && <span style={{ background: "#dcfce7", color: "#15803d", fontSize: "10px", padding: "1px 6px", borderRadius: "4px", marginLeft: "6px" }}>Default</span>}
                  </strong>
                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>{a.text}</div>
                </div>
              ))}
            </div>

            {/* Add New Address Form */}
            <form onSubmit={handleAddAddress} style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
              <div style={{ fontSize: "13px", fontWeight: "800", marginBottom: "10px", color: "#0f172a" }}>
                + Add New Address
              </div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                {["Home", "Work", "Other"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNewAddrType(t)}
                    style={{
                      padding: "5px 14px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      border: "1px solid",
                      borderColor: newAddrType === t ? "#ea580c" : "#cbd5e1",
                      background: newAddrType === t ? "#ea580c" : "#fff",
                      color: newAddrType === t ? "#fff" : "#334155",
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Street address, building name, landmark, Kathmandu..."
                value={newAddrText}
                onChange={(e) => setNewAddrText(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px", marginBottom: "10px", fontFamily: "inherit" }}
              />
              <button
                type="submit"
                style={{ width: "100%", background: "#ea580c", color: "#fff", border: "none", padding: "11px", borderRadius: "10px", fontWeight: "800", fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }}
              >
                Save & Select Address
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

export default FoodieTopNav;
