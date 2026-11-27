import { useState, useEffect } from "react";
import api from "../api";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";

const ROLE_BADGES = {
  superadmin: { label: "👑 Main Admin", bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
  admin:      { label: "👑 Main Admin", bg: "#fef3c7", color: "#92400e", border: "#fde68a" },
  hotel:      { label: "🏨 Restaurant Partner", bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe" },
  restaurant: { label: "🏨 Restaurant Partner", bg: "#eff6ff", color: "#1e40af", border: "#bfdbfe" },
  deliveryStaff:      { label: "Delivery Staff", bg: "#f5f3ff", color: "#6b21a8", border: "#ddd6fe" },
  customer:   { label: "🛒 Customer",   bg: "#ecfdf5", color: "#065f46", border: "#a7f3d0" },
};

function getBadge(role) {
  return ROLE_BADGES[role?.toLowerCase()] ?? ROLE_BADGES["customer"];
}

function fmtDate(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  // Reset password modal state
  const [resetUser, setResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const res = await api.get("/auth/users");
      setUsers(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || "Could not load users", "error");
    }
    setLoading(false);
  }

  async function handleRoleChange(userId, newRole) {
    setUpdatingId(userId);
    try {
      await api.put(`/auth/users/${userId}/role`, { role: newRole });
      showToast(`User role updated to ${newRole.toUpperCase()} ✓`, "success");
      await loadUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not update role", "error");
    }
    setUpdatingId(null);
  }

  async function handleToggleBlock(userId, currentBlocked) {
    setUpdatingId(userId);
    try {
      await api.put(`/auth/users/${userId}/block`);
      showToast(`User account ${currentBlocked ? "unblocked" : "blocked"} ✓`, "success");
      await loadUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not toggle block status", "error");
    }
    setUpdatingId(null);
  }

  async function handleDeleteUser(userId, userName) {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    setUpdatingId(userId);
    try {
      await api.delete(`/auth/users/${userId}`);
      showToast("User account deleted ✓", "info");
      await loadUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not delete user", "error");
    }
    setUpdatingId(null);
  }

  async function handleResetPasswordSubmit(e) {
    e.preventDefault();
    if (!resetUser || !newPassword || newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setSavingPass(true);
    try {
      await api.put(`/auth/users/${resetUser.id}/reset-password`, {
        new_password: newPassword,
      });
      showToast(`Password reset successfully for ${resetUser.email}! ✓`, "success");
      setResetUser(null);
      setNewPassword("");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to reset password", "error");
    } finally {
      setSavingPass(false);
    }
  }

  const filteredUsers = users.filter((u) => {
    const isRest = u.role === "restaurant" || u.role === "hotel" || Boolean(u.restaurant_name);
    let matchesRole = true;
    if (roleFilter === "customer") matchesRole = u.role === "customer" && !u.restaurant_name;
    else if (roleFilter === "restaurant") matchesRole = isRest;
    else if (roleFilter === "admin") matchesRole = ["admin", "superadmin"].includes(u.role);

    const q = search.trim().toLowerCase();
    const matchesQuery =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.restaurant_name && u.restaurant_name.toLowerCase().includes(q)) ||
      u.phone.includes(q) ||
      u.address.toLowerCase().includes(q);

    return matchesRole && matchesQuery;
  });

  const countByRole = {
    customer: users.filter((u) => u.role === "customer" && !u.restaurant_name).length,
    restaurant: users.filter((u) => u.role === "hotel" || u.role === "restaurant" || Boolean(u.restaurant_name)).length,
    admin: users.filter((u) => ["admin", "superadmin"].includes(u.role)).length,
  };

  if (loading) return <Loader text="Loading all system users…" />;

  return (
    <div className="au-page" style={{ maxWidth: "1150px", margin: "24px auto", padding: "0 20px" }}>

      {/* ── PAGE HEADER ─────────────────────────────────────── */}
      <div className="au-header">
        <div className="au-header-left">
          <span className="au-header-icon">👑</span>
          <div>
            <h2 className="au-title">Main Admin — User & Restaurant Accounts</h2>
            <p className="au-subtitle">View associated restaurant business profiles, manage roles & reset passwords</p>
          </div>
        </div>
      </div>

      {/* ── STAT STRIP ─────────────────────────────────────── */}
      <div className="au-stat-strip">
        <div className="au-stat">
          <span className="au-stat-num">{users.length}</span>
          <span className="au-stat-label">Total Accounts</span>
        </div>
        <div className="au-stat-div" />
        <div className="au-stat">
          <span className="au-stat-num green">{countByRole.customer}</span>
          <span className="au-stat-label">Customers</span>
        </div>
        <div className="au-stat-div" />
        <div className="au-stat">
          <span className="au-stat-num blue">{countByRole.restaurant}</span>
          <span className="au-stat-label">Restaurants</span>
        </div>
        <div className="au-stat-div" />
        <div className="au-stat">
          <span className="au-stat-num amber">{countByRole.admin}</span>
          <span className="au-stat-label">Main Admins</span>
        </div>
      </div>

      {/* ── TOOLBAR: FILTER & SEARCH ─────────────────────────── */}
      <div className="au-toolbar">
        <div className="au-role-pills">
          <button className={`au-pill ${roleFilter === "all" ? "active" : ""}`} onClick={() => setRoleFilter("all")}>
            👥 All Users ({users.length})
          </button>
          <button className={`au-pill ${roleFilter === "customer" ? "active" : ""}`} onClick={() => setRoleFilter("customer")}>
            🛒 Customers ({countByRole.customer})
          </button>
          <button className={`au-pill ${roleFilter === "restaurant" ? "active" : ""}`} onClick={() => setRoleFilter("restaurant")}>
            🏨 Restaurants ({countByRole.restaurant})
          </button>
          <button className={`au-pill ${roleFilter === "admin" ? "active" : ""}`} onClick={() => setRoleFilter("admin")}>
            👑 Admins ({countByRole.admin})
          </button>
        </div>

        <div className="au-search-wrap">
          <span className="au-search-icon">🔍</span>
          <input
            className="au-search-input"
            type="text"
            placeholder="Search by name, email, restaurant, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="au-search-clear" onClick={() => setSearch("")}>✕</button>
          )}
        </div>
      </div>

      <p className="au-count-text">
        Showing <strong>{filteredUsers.length}</strong> user account{filteredUsers.length === 1 ? "" : "s"}
      </p>

      {/* ── USER LIST GRID / CARDS ──────────────────────────── */}
      <div className="au-user-list">
        {filteredUsers.map((u, index) => {
          const badge = getBadge(u.role);
          const isBusy = updatingId === u.id;

          return (
            <div className={`au-user-card ${isBusy ? "busy" : ""}`} key={u.id} style={{ "--i": index }}>

              <div className="au-card-head">
                <div className="au-user-avatar-circle">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="au-user-main-info">
                  <h4 className="au-user-name">
                    {u.name} {u.is_blocked ? <span style={{ fontSize: "11px", background: "#fef2f2", color: "#dc2626", padding: "2px 6px", borderRadius: "4px", marginLeft: "4px" }}>BLOCKED</span> : null}
                  </h4>
                  <span className="au-user-email">✉️ {u.email}</span>
                </div>
                <span
                  className="au-role-badge"
                  style={{ background: badge.bg, color: badge.color, borderColor: badge.border }}
                >
                  {badge.label}
                </span>
              </div>

              <div className="au-card-body">
                {/* Linked Restaurant Profile Badge (If account is restaurant) */}
                {u.restaurant_name ? (
                  <div style={{ background: "#eff6ff", padding: "8px 12px", borderRadius: "8px", border: "1px solid #bfdbfe", marginBottom: "8px" }}>
                    <div style={{ fontSize: "11px", color: "#1e40af", fontWeight: "800", textTransform: "uppercase" }}>
                      🏪 LINKED RESTAURANT PROFILE:
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "900", color: "#1e3a8a" }}>
                      {u.restaurant_name}
                    </div>
                  </div>
                ) : null}

                <div className="au-info-row">
                  <span className="au-info-label">📞 Phone:</span>
                  <span className="au-info-val">{u.phone || "N/A"}</span>
                </div>
                <div className="au-info-row">
                  <span className="au-info-label">📍 Address:</span>
                  <span className="au-info-val">{u.address || "N/A"}</span>
                </div>
                <div className="au-info-row">
                  <span className="au-info-label">🗓️ Joined:</span>
                  <span className="au-info-val">{fmtDate(u.created_at)}</span>
                </div>
              </div>

              <div className="au-card-footer" style={{ gap: "6px", flexWrap: "wrap" }}>
                <div className="au-role-selector-wrap">
                  <label htmlFor={`role-sel-${u.id}`}>Role:</label>
                  <select
                    id={`role-sel-${u.id}`}
                    className="au-role-select"
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={isBusy}
                  >
                    <option value="customer">🛒 Customer</option>
                    <option value="restaurant">🏨 Restaurant</option>
                    <option value="admin">👑 Main Admin</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setResetUser(u);
                    setNewPassword("password");
                  }}
                  style={{
                    background: "#f0fdf4",
                    color: "#166534",
                    border: "1px solid #bbf7d0",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  🔑 Reset Password
                </button>

                <button
                  onClick={() => handleToggleBlock(u.id, u.is_blocked)}
                  disabled={isBusy}
                  style={{
                    background: u.is_blocked ? "#dcfce7" : "#fef2f2",
                    color: u.is_blocked ? "#16a34a" : "#dc2626",
                    border: "1px solid #cbd5e1",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  {u.is_blocked ? "Unblock" : "Block"}
                </button>

                <button
                  className="au-delete-user-btn"
                  onClick={() => handleDeleteUser(u.id, u.name)}
                  disabled={isBusy}
                  title="Delete user account"
                >
                  🗑️
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* ── RESET PASSWORD MODAL ── */}
      {resetUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card-box" style={{ width: "420px", padding: "24px", background: "#ffffff", borderRadius: "16px" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "900", color: "#0f172a" }}>
              🔑 Reset User Password
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0" }}>
              Setting new password for <strong>{resetUser.name}</strong> (<code>{resetUser.email}</code>)
              {resetUser.restaurant_name ? (
                <div style={{ marginTop: "4px", color: "#2563eb", fontWeight: "700" }}>
                  🏪 Associated Restaurant: {resetUser.restaurant_name}
                </div>
              ) : null}
            </p>

            <form onSubmit={handleResetPasswordSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>New Password *</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. password or admin123"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" disabled={savingPass} className="btn-primary" style={{ flex: 1, padding: "10px", fontWeight: "800" }}>
                  {savingPass ? "Resetting..." : "Confirm Reset Password"}
                </button>
                <button type="button" onClick={() => setResetUser(null)} className="btn-secondary" style={{ padding: "10px 16px" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminUsers;
