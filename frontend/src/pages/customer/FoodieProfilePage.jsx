import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCustomer } from "../../context/CustomerContext";

const SUB_NAV = [
  { id: "PROFILE",   icon: "👤", label: "Profile Info" },
  { id: "ADDRESSES", icon: "📍", label: "Delivery Addresses" },
  { id: "PAYMENTS",  icon: "💳", label: "Payment Methods" },
];

const LINK_NAV = [
  { id: "history", icon: "📜", label: "Past Orders" },
  { id: "support", icon: "💬", label: "Help & Support" },
];

function FoodieProfilePage({ onNavigateSection }) {
  const { addresses, addAddress } = useCustomer();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("PROFILE");
  const [newAddrText, setNewAddrText] = useState("");
  const [newAddrType, setNewAddrType] = useState("Home");
  const [showAddForm, setShowAddForm] = useState(false);
  const [saved, setSaved] = useState(false);

  const displayName = user ? (user.name || user.username || user.email?.split("@")[0] || "Account") : "Aarav Sharma";
  const initials = displayName.charAt(0).toUpperCase();

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!newAddrText.trim()) return;
    addAddress(newAddrType, newAddrText);
    setNewAddrText("");
    setShowAddForm(false);
  };

  return (
    <div className="fc-page-content">
      <h1 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", margin: "0 0 22px" }}>
        👤 My Account
      </h1>

      <div className="fc-profile-layout">
        {/* ─── Left Sidebar ─── */}
        <div className="fc-profile-subnav">
          {/* Avatar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "16px 0 18px", borderBottom: "1px solid #f1f5f9", marginBottom: "6px" }}>
            <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg,#ea580c,#c2410c)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "22px" }}>{initials}</div>
            <strong style={{ fontSize: "14px", color: "#0f172a" }}>{displayName}</strong>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Foodie Corner Member</span>
          </div>

          {/* Section tabs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "8px" }}>
            {SUB_NAV.map((item) => (
              <button
                key={item.id}
                className={`fc-profile-subnav-btn${activeTab === item.id ? " active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* External-navigation links */}
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "8px", display: "flex", flexDirection: "column", gap: "2px" }}>
            {LINK_NAV.map((item) => (
              <button
                key={item.id}
                className="fc-profile-subnav-btn"
                onClick={() => onNavigateSection(item.id)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Sign Out */}
          <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "8px", paddingTop: "8px" }}>
            <button
              onClick={handleSignOut}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "10px",
                border: "none",
                background: "none",
                color: "#dc2626",
                fontWeight: "800",
                fontSize: "13px",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "inherit"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>

        {/* ─── Right Content ─── */}
        <div className="fc-profile-content">

          {/* ── PROFILE INFO ── */}
          {activeTab === "PROFILE" && (
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", margin: "0 0 20px" }}>
                Personal Information
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "440px" }}>
                {[
                  { label: "Full Name", value: user?.name || user?.username || displayName, type: "text", editable: true },
                  { label: "Email Address", value: user?.email ? user.email.replace(/(.{3})(.*)(@.*)/, "$1***$3") : "aarav.s****@gmail.com", type: "email", editable: false },
                  { label: "Phone Number", value: user?.phone || "+977 9841****67", type: "tel", editable: false },
                  { label: "Account Role", value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Customer", type: "text", editable: false },
                ].map((field) => (
                  <div key={field.label}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#64748b", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      defaultValue={field.value}
                      readOnly={!field.editable}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: "9px", border: "1px solid #cbd5e1", fontSize: "14px", fontFamily: "inherit", background: field.editable ? "#fff" : "#f8fafc", outline: "none", color: "#0f172a" }}
                    />
                  </div>
                ))}

                <button
                  onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
                  style={{ alignSelf: "flex-start", background: "#ea580c", color: "#fff", border: "none", borderRadius: "10px", padding: "11px 24px", fontSize: "14px", fontWeight: "800", cursor: "pointer", fontFamily: "inherit", marginTop: "4px" }}
                >
                  {saved ? "✓ Saved!" : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* ── ADDRESSES ── */}
          {activeTab === "ADDRESSES" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                  Saved Addresses ({addresses.length})
                </h2>
                <button onClick={() => setShowAddForm(!showAddForm)} style={{ background: "#ea580c", color: "#fff", border: "none", borderRadius: "9px", padding: "9px 16px", fontSize: "13px", fontWeight: "800", cursor: "pointer", fontFamily: "inherit" }}>
                  + Add New
                </button>
              </div>

              {/* Add Form */}
              {showAddForm && (
                <form onSubmit={handleSaveAddress} style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "14px", padding: "18px", marginBottom: "18px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "800", color: "#c2410c", marginBottom: "10px" }}>New Address</div>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    {["Home", "Work", "Other"].map((t) => (
                      <button key={t} type="button" onClick={() => setNewAddrType(t)} style={{ padding: "5px 14px", borderRadius: "7px", fontSize: "12px", fontWeight: "700", border: "1px solid", borderColor: newAddrType === t ? "#ea580c" : "#e2e8f0", background: newAddrType === t ? "#ea580c" : "#fff", color: newAddrType === t ? "#fff" : "#475569", cursor: "pointer", fontFamily: "inherit" }}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <input type="text" placeholder="Full address, building name, landmark..." value={newAddrText} onChange={(e) => setNewAddrText(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: "9px", border: "1px solid #cbd5e1", fontSize: "13px", fontFamily: "inherit", marginBottom: "10px", outline: "none" }} />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button type="submit" style={{ background: "#ea580c", color: "#fff", border: "none", borderRadius: "9px", padding: "10px 20px", fontSize: "13px", fontWeight: "800", cursor: "pointer", fontFamily: "inherit" }}>Save Address</button>
                    <button type="button" onClick={() => setShowAddForm(false)} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "9px", padding: "10px 16px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                  </div>
                </form>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {addresses.map((a) => (
                  <div key={a.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "16px", borderRadius: "14px", position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <strong style={{ fontSize: "14px", color: "#0f172a" }}>📍 {a.type}</strong>
                      {a.isDefault && (
                        <span style={{ background: "#dcfce7", color: "#15803d", fontSize: "10px", fontWeight: "800", padding: "2px 7px", borderRadius: "5px" }}>Default</span>
                      )}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.5" }}>{a.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PAYMENT METHODS ── */}
          {activeTab === "PAYMENTS" && (
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", margin: "0 0 18px" }}>
                Saved Payment Methods
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "18px" }}>
                Payment credentials are masked for your security. Full details are never displayed.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "520px" }}>
                {[
                  { icon: "📲", title: "eSewa / Khalti UPI", sub: "UPI ID: aarav****@nabilbank", tag: "Primary" },
                  { icon: "💳", title: "Nabil Bank Visa Card", sub: "Card ending in **** 4821", tag: "Saved" },
                ].map((pm) => (
                  <div key={pm.title} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "16px 18px", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ fontSize: "26px" }}>{pm.icon}</span>
                      <div>
                        <strong style={{ fontSize: "14px", color: "#0f172a" }}>{pm.title}</strong>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{pm.sub}</div>
                      </div>
                    </div>
                    <span style={{ background: pm.tag === "Primary" ? "#dbeafe" : "#f1f5f9", color: pm.tag === "Primary" ? "#1d4ed8" : "#64748b", fontSize: "11px", fontWeight: "800", padding: "3px 8px", borderRadius: "6px" }}>
                      {pm.tag}
                    </span>
                  </div>
                ))}

                <button style={{ alignSelf: "flex-start", background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "10px", padding: "11px 20px", fontSize: "13px", fontWeight: "700", cursor: "pointer", color: "#475569", fontFamily: "inherit", marginTop: "4px" }}>
                  + Add New Payment Method
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FoodieProfilePage;
