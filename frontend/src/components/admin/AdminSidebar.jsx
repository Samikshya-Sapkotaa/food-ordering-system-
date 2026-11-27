import React from "react";
import { useAdmin, ROLES } from "../../context/AdminContext";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { id: "overview",  label: "Dashboard",         icon: "📊" },
    ]
  },
  {
    label: "Platform Management",
    items: [
      { id: "restaurants", label: "Restaurant Fleet", icon: "🏨" },
      { id: "customers",   label: "Customer Support", icon: "👤" },
      { id: "zones",       label: "Logistics Zones",  icon: "🗺️" },
    ]
  },
  {
    label: "Finance & Operations",
    items: [
      { id: "disputes", label: "Dispute Resolution", icon: "⚖️" },
      { id: "pricing",  label: "Pricing & Coupons",  icon: "🏷️" },
    ]
  },
  {
    label: "Quality & Insights",
    items: [
      { id: "reviews",   label: "Review Moderation", icon: "⭐" },
    ]
  },
  {
    label: "Admin & Security",
    items: [
      { id: "team",  label: "Team & Permissions", icon: "🔑" },
      { id: "audit", label: "Audit Logs",          icon: "📜" },
    ]
  }
];

function AdminSidebar({ activeSection, onSelectSection, mobileOpen = false }) {
  const { currentRoleKey, setCurrentRoleKey, currentRole } = useAdmin();

  return (
    <div className={`ap-sidebar${mobileOpen ? " mobile-open" : ""}`}>
      {/* Brand Header */}
      <div
        className="ap-sidebar-brand"
        onClick={() => onSelectSection("overview")}
        style={{ cursor: "pointer" }}
        title="Go to Dashboard"
      >
        <div className="ap-brand-logo">🍕</div>
        <div>
          <h2 className="ap-brand-title">Foodie Corner</h2>
          <p className="ap-brand-subtitle">Admin Control Center</p>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="ap-nav-menu">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="ap-nav-section-label">{group.label}</div>
            {group.items.map((item) => {
              const isAllowed = item.id === "audit" || currentRole.permissions[item.id] !== false;
              return (
                <button
                  key={item.id}
                  className={`ap-nav-item ${activeSection === item.id ? "active" : ""}`}
                  onClick={() => isAllowed && onSelectSection(item.id)}
                  disabled={!isAllowed}
                  title={!isAllowed ? "Restricted by your admin role" : item.label}
                >
                  <span className="ap-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {!isAllowed && (
                    <span style={{ marginLeft: "auto", fontSize: "10px", color: "#475569" }}>🔒</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sub-Admin Role Switcher */}
      <div className="ap-role-switcher-box">
        <div className="ap-role-label">Active Admin Role</div>
        {/* Current role badge */}
        <div style={{ background: "rgba(234,88,12,0.12)", border: "1px solid rgba(234,88,12,0.25)", borderRadius: "8px", padding: "8px 12px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>👑</span>
          <div>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "#fb923c" }}>{currentRole.label}</div>
            <div style={{ fontSize: "10px", color: "#64748b", marginTop: "1px" }}>Active session</div>
          </div>
        </div>
        <select
          className="ap-role-select"
          value={currentRoleKey}
          onChange={(e) => setCurrentRoleKey(e.target.value)}
        >
          {Object.keys(ROLES).map((key) => (
            <option key={key} value={key}>{ROLES[key].label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default AdminSidebar;
