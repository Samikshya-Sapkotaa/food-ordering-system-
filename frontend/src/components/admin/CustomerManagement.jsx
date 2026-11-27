/**
 * Admin — User Management (Customer Support)
 * ─────────────────────────────────────────────
 * Features:
 *  - Real data from GET /api/auth/users (live DB)
 *  - Search by name / email / phone / role
 *  - Filter by role (customer / hotel / deliveryPartner / admin)
 *  - Role change (PUT /api/auth/users/:id/role)
 *  - Delete user (DELETE /api/auth/users/:id)
 *  - Issue wallet refund (mock, logged to admin audit)
 *  - Flag / unflag suspicious account (mock)
 *  - User detail slide-out drawer
 *  - Summary stat cards at top
 */
import React, { useState, useEffect } from "react";
import api from "../../api";
import { useAdmin } from "../../context/AdminContext";
import ActionReasonModal from "./ActionReasonModal";

const ROLE_META = {
  customer:   { label: "Customer",    color: "#1d4ed8", bg: "#dbeafe", icon: "👤" },
  hotel:      { label: "Restaurant",  color: "#d97706", bg: "#fef3c7", icon: "🏨" },
  deliveryPartner:      { label: "Delivery Partner",       color: "#0891b2", bg: "#cffafe", icon: "🛵" },
  admin:      { label: "Admin",       color: "#7c3aed", bg: "#ede9fe", icon: "🔑" },
  superadmin: { label: "Super Admin", color: "#dc2626", bg: "#fee2e2", icon: "👑" },
};

function RoleBadge({ role }) {
  const meta = ROLE_META[role] || { label: role, color: "#64748b", bg: "#f1f5f9", icon: "❓" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      background: meta.bg, color: meta.color,
      padding: "3px 10px", borderRadius: "20px",
      fontSize: "11px", fontWeight: "800"
    }}>
      {meta.icon} {meta.label}
    </span>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e8ecf3", borderRadius: "14px",
      padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)", flex: 1
    }}>
      <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
        <div style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", lineHeight: 1.2 }}>{value}</div>
      </div>
    </div>
  );
}

function UserDrawer({ user, onClose, onRoleChange, onDelete }) {
  const [newRole, setNewRole] = useState(user.role);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleRoleChange = async () => {
    if (newRole === user.role) return;
    setSaving(true);
    await onRoleChange(user.id, newRole);
    setSaving(false);
  };

  return (
    <div className="ap-drawer-overlay" onClick={onClose}>
      <div className="ap-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: "0 0 4px" }}>User Detail</h2>
            <span style={{ fontSize: "12px", color: "#64748b" }}>ID #{user.id}</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#64748b" }}>✕</button>
        </div>

        {/* Avatar + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", padding: "18px", background: "#f8fafc", borderRadius: "14px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "linear-gradient(135deg,#ea580c,#c2410c)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "22px", flexShrink: 0 }}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a" }}>{user.name}</div>
            <div style={{ fontSize: "13px", color: "#64748b" }}>{user.email}</div>
            <div style={{ marginTop: "6px" }}><RoleBadge role={user.role} /></div>
          </div>
        </div>

        {/* Contact Info */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Contact Information</div>
          {[
            { label: "Phone", value: user.phone || "—" },
            { label: "Address", value: user.address || "—" },
            { label: "Joined", value: user.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—" },
          ].map((f) => (
            <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f8fafc", fontSize: "13px" }}>
              <span style={{ color: "#64748b", fontWeight: "600" }}>{f.label}</span>
              <span style={{ color: "#0f172a", fontWeight: "700", textAlign: "right", maxWidth: "65%" }}>{f.value}</span>
            </div>
          ))}
        </div>

        {/* Role Change */}
        <div style={{ marginBottom: "20px", background: "#f8fafc", borderRadius: "12px", padding: "16px" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#475569", marginBottom: "10px" }}>Change User Role</div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
            {Object.keys(ROLE_META).map((r) => (
              <button key={r} onClick={() => setNewRole(r)} style={{
                padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "800",
                border: "1.5px solid",
                borderColor: newRole === r ? ROLE_META[r].color : "#e2e8f0",
                background: newRole === r ? ROLE_META[r].bg : "#fff",
                color: newRole === r ? ROLE_META[r].color : "#64748b",
                cursor: "pointer", fontFamily: "inherit"
              }}>
                {ROLE_META[r].icon} {ROLE_META[r].label}
              </button>
            ))}
          </div>
          <button
            onClick={handleRoleChange}
            disabled={saving || newRole === user.role}
            style={{
              width: "100%", background: newRole !== user.role ? "#ea580c" : "#e2e8f0",
              color: newRole !== user.role ? "#fff" : "#94a3b8",
              border: "none", borderRadius: "9px", padding: "10px",
              fontSize: "13px", fontWeight: "800", cursor: newRole !== user.role ? "pointer" : "not-allowed",
              fontFamily: "inherit", transition: "all 0.15s"
            }}
          >
            {saving ? "Saving..." : newRole !== user.role ? `✓ Change to ${ROLE_META[newRole]?.label}` : "No Change"}
          </button>
        </div>

        {/* Danger Zone */}
        <div style={{ border: "1px solid #fee2e2", borderRadius: "12px", padding: "16px" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#b91c1c", marginBottom: "10px" }}>⚠️ Danger Zone</div>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} style={{ width: "100%", background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: "9px", padding: "10px", fontSize: "13px", fontWeight: "800", cursor: "pointer", fontFamily: "inherit" }}>
              🗑️ Delete This User Account
            </button>
          ) : (
            <div>
              <p style={{ fontSize: "12px", color: "#991b1b", marginBottom: "10px" }}>This action is <strong>permanent</strong> and cannot be undone. The user's orders, cart, and data will remain in the system but the account will be deleted.</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => onDelete(user.id)} style={{ flex: 1, background: "#dc2626", color: "#fff", border: "none", borderRadius: "9px", padding: "10px", fontSize: "13px", fontWeight: "800", cursor: "pointer", fontFamily: "inherit" }}>
                  Confirm Delete
                </button>
                <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", borderRadius: "9px", padding: "10px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CustomerManagement() {
  const { issueRefund, flagCustomerAccount, customers: mockCustomers } = useAdmin();

  // ── State ────────────────────────────────────────────
  const [dbUsers, setDbUsers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [refundTarget, setRefundTarget] = useState(null);
  const [refundAmount, setRefundAmount] = useState("100");
  const [toast, setToast]           = useState(null);
  const [activeTab, setActiveTab]   = useState("db"); // "db" | "mock"

  // ── Load real users from DB ──────────────────────────
  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/auth/users");
      setDbUsers(res.data || []);
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You don't have permission to view all users. Switch to Super Admin role.");
      } else {
        setError("Could not load users from the database. Showing mock data instead.");
      }
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleRoleChange(userId, newRole) {
    try {
      await api.put(`/auth/users/${userId}/role`, { role: newRole });
      setDbUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      if (selectedUser?.id === userId) setSelectedUser((prev) => ({ ...prev, role: newRole }));
      showToast(`✓ Role updated to ${ROLE_META[newRole]?.label}`);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update role", "error");
    }
  }

  async function handleDelete(userId) {
    try {
      await api.delete(`/auth/users/${userId}`);
      setDbUsers((prev) => prev.filter((u) => u.id !== userId));
      setSelectedUser(null);
      showToast("✓ User account deleted");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete user", "error");
    }
  }

  const handleConfirmRefund = (reason) => {
    if (refundTarget && refundAmount) {
      issueRefund(refundTarget, Number(refundAmount), reason);
      showToast(`✓ Rs. ${refundAmount} refund issued and logged`);
      setRefundTarget(null);
    }
  };

  // ── Filter logic ─────────────────────────────────────
  const filtered = dbUsers.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.phone?.includes(term) ||
      String(u.id).includes(term);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // ── Stats ─────────────────────────────────────────────
  const stats = {
    total:    dbUsers.length,
    customers:dbUsers.filter((u) => u.role === "customer").length,
    hotels:   dbUsers.filter((u) => u.role === "hotel").length,
    deliveryPartners:   dbUsers.filter((u) => u.role === "deliveryPartner").length,
    admins:   dbUsers.filter((u) => ["admin", "superadmin"].includes(u.role)).length,
  };

  return (
    <div>
      {/* ── Toast notification ── */}
      {toast && (
        <div style={{
          position: "fixed", top: "80px", right: "20px", zIndex: 9999,
          background: toast.type === "error" ? "#dc2626" : "#16a34a",
          color: "#fff", padding: "12px 20px", borderRadius: "12px",
          fontSize: "13px", fontWeight: "700", boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          animation: "apFadeIn 0.3s ease"
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "24px" }}>
        <StatCard icon="👥" label="Total Users"   value={stats.total}     color="#0f172a" />
        <StatCard icon="👤" label="Customers"     value={stats.customers} color="#1d4ed8" />
        <StatCard icon="🏨" label="Restaurants"   value={stats.hotels}    color="#d97706" />
        <StatCard icon="🛵" label="Delivery Partners"         value={stats.deliveryPartners}    color="#0891b2" />
        <StatCard icon="🔑" label="Admins"         value={stats.admins}    color="#7c3aed" />
      </div>

      {/* ── Main Table Card ── */}
      <div className="ap-table-card">
        {/* Toolbar */}
        <div className="ap-table-toolbar">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "14px" }}>🔍</span>
              <input
                type="text"
                className="ap-search-input"
                placeholder="Search by name, email, phone, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: "34px" }}
              />
            </div>

            <select
              className="ap-select-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              {Object.keys(ROLE_META).map((r) => (
                <option key={r} value={r}>{ROLE_META[r].icon} {ROLE_META[r].label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>
              {filtered.length} of {dbUsers.length} users
            </span>
            <button onClick={loadUsers} className="ap-btn-ghost" style={{ fontSize: "12px" }}>
              ⟳ Refresh
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", padding: "12px 18px", fontSize: "13px", color: "#92400e", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px", animation: "spin 1s linear infinite" }}>⏳</div>
            <strong>Loading users from database...</strong>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>👥</div>
            <strong>No users match your filters</strong>
            <p style={{ fontSize: "13px", marginTop: "6px" }}>Try clearing the search or changing the role filter.</p>
          </div>
        ) : (
          <table className="ap-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Joined</th>
                <th style={{ textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} style={{ cursor: "pointer" }} onClick={() => setSelectedUser(u)}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#ea580c,#c2410c)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "14px", flexShrink: 0 }}>
                        {u.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <div style={{ fontWeight: "800", color: "#0f172a", fontSize: "13px" }}>{u.name}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>ID #{u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "13px", color: "#334155" }}>{u.email}</div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{u.phone}</div>
                  </td>
                  <td><RoleBadge role={u.role} /></td>
                  <td style={{ fontSize: "12px", color: "#64748b" }}>
                    {u.created_at
                      ? new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
                      <button
                        onClick={() => setSelectedUser(u)}
                        style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "7px", padding: "5px 12px", fontSize: "11px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        👁 View
                      </button>
                      <select
                        value={u.role}
                        onChange={(e) => { e.stopPropagation(); handleRoleChange(u.id, e.target.value); }}
                        onClick={(e) => e.stopPropagation()}
                        style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "7px", padding: "5px 8px", fontSize: "11px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        {Object.keys(ROLE_META).map((r) => (
                          <option key={r} value={r}>{ROLE_META[r].icon} {ROLE_META[r].label}</option>
                        ))}
                      </select>
                      <button
                        onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete ${u.name}?`)) handleDelete(u.id); }}
                        style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: "7px", padding: "5px 8px", fontSize: "11px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Mock Customer Extras (Refund / Flag section) ── */}
      {mockCustomers && mockCustomers.length > 0 && (
        <div className="ap-table-card" style={{ marginTop: "24px" }}>
          <div className="ap-table-toolbar" style={{ background: "#fffbeb" }}>
            <span style={{ fontSize: "13px", fontWeight: "800", color: "#92400e" }}>
              🚨 Flagged / Refund Queue ({mockCustomers.filter(c => c.flaggedSuspicious || c.refundHistory.length > 0).length} accounts)
            </span>
          </div>
          <table className="ap-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Masked Contact</th>
                <th>Orders / Spent</th>
                <th>Refund History</th>
                <th>Flag Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockCustomers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: "800" }}>{c.name}</div>
                    {c.flaggedSuspicious && <span style={{ fontSize: "10px", color: "#dc2626", fontWeight: "800" }}>⚠️ SUSPICIOUS</span>}
                  </td>
                  <td>
                    <div style={{ fontSize: "12px" }}>{c.email}</div>
                    <code style={{ background: "#f1f5f9", padding: "2px 5px", borderRadius: "4px", fontSize: "10px" }}>{c.paymentMethodMasked}</code>
                  </td>
                  <td style={{ fontSize: "12px" }}>
                    <strong>{c.orderCount}</strong> orders<br />
                    <span style={{ color: "#64748b" }}>Rs. {c.totalSpent}</span>
                  </td>
                  <td style={{ fontSize: "11px" }}>
                    {c.refundHistory.length === 0 ? <span style={{ color: "#94a3b8" }}>None</span> :
                      c.refundHistory.map((rf, i) => <div key={i} style={{ color: "#c2410c" }}>Rs {rf.amount} — {rf.reason}</div>)}
                  </td>
                  <td>
                    {c.flaggedSuspicious
                      ? <span className="ap-badge ap-badge-suspended">Suspicious Claimer</span>
                      : <span className="ap-badge ap-badge-active">Normal</span>}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <button onClick={() => { setRefundTarget(c.id); setRefundAmount("150"); }}
                        style={{ background: "#dbeafe", color: "#1d4ed8", border: "none", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>
                        💳 Refund
                      </button>
                      {!c.flaggedSuspicious && (
                        <button onClick={() => { flagCustomerAccount(c.id, "Flagged for repeated false claims"); showToast("Account flagged"); }}
                          style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>
                          ⚠️ Flag
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Refund Modal ── */}
      {refundTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1050 }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", width: "340px" }}>
            <h3 style={{ margin: "0 0 12px", fontWeight: "900" }}>Issue Wallet Refund</h3>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Refund Amount (Rs)</label>
            <input type="number" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px", fontFamily: "inherit", marginTop: "4px", marginBottom: "12px" }} />
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => handleConfirmRefund("Manual admin refund")}
                style={{ flex: 1, background: "#0284c7", color: "#fff", border: "none", borderRadius: "9px", padding: "10px", fontWeight: "800", cursor: "pointer", fontFamily: "inherit" }}>
                ✓ Approve Refund
              </button>
              <button onClick={() => setRefundTarget(null)}
                style={{ flex: 1, background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "9px", padding: "10px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── User Detail Drawer ── */}
      {selectedUser && (
        <UserDrawer
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onRoleChange={handleRoleChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
