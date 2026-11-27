import { useState, useEffect } from "react";
import api from "../api";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";

function AdminRestaurants() {
  const { showToast } = useToast();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state for creating new restaurant
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [cuisine, setCuisine] = useState("");

  // Reset password state
  const [resetRest, setResetRest] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [restRes, usersRes] = await Promise.all([
        api.get("/restaurants/all"),
        api.get("/auth/users"),
      ]);
      setRestaurants(restRes.data);
      setUsers(usersRes.data);
      if (usersRes.data.length > 0) setSelectedUser(usersRes.data[0].id);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id, isApproved) {
    try {
      await api.put(`/restaurants/${id}/approve`, { is_approved: isApproved });
      showToast(isApproved === 1 ? "Restaurant approved!" : "Restaurant application rejected", "success");
      loadData();
    } catch (err) {
      showToast("Operation failed", "error");
    }
  }

  async function handleToggleActive(id) {
    try {
      await api.put(`/restaurants/${id}/toggle`);
      showToast("Restaurant status toggled", "info");
      loadData();
    } catch (err) {
      showToast("Failed to toggle status", "error");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this restaurant partner? This cannot be undone.")) return;

    try {
      await api.delete(`/restaurants/${id}`);
      showToast("Restaurant deleted successfully", "success");
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete restaurant", "error");
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post("/restaurants", {
        user_id: Number(selectedUser),
        name,
        address,
        phone,
        cuisine,
      });
      showToast("Restaurant registered successfully!", "success");
      setShowModal(false);
      setName("");
      setAddress("");
      setPhone("");
      setCuisine("");
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create restaurant", "error");
    }
  }

  async function handleResetPasswordSubmit(e) {
    e.preventDefault();
    if (!resetRest || !resetRest.user_id) {
      showToast("No user account linked to this restaurant", "error");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setSavingPass(true);
    try {
      await api.put(`/auth/users/${resetRest.user_id}/reset-password`, {
        new_password: newPassword,
      });
      showToast(`Password reset successfully for ${resetRest.name} (${resetRest.owner_email})! ✓`, "success");
      setResetRest(null);
      setNewPassword("");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to reset password", "error");
    } finally {
      setSavingPass(false);
    }
  }

  if (loading) return <Loader text="Loading restaurants..." />;

  const pendingList = restaurants.filter((r) => r.is_approved === 0);
  const activeList = restaurants.filter((r) => r.is_approved === 1);

  return (
    <div style={{ maxWidth: "1100px", margin: "30px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
            🏪 Restaurant Management & Accounts (Admin)
          </h2>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>
            Approve partner applications, inspect KYC documents, and reset restaurant passwords.
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary" style={{ padding: "10px 20px", fontSize: "14px", fontWeight: "800" }}>
          + Register New Restaurant
        </button>
      </div>

      {/* Pending Approvals Section */}
      {pendingList.length > 0 && (
        <div className="card-box" style={{ padding: "20px", marginBottom: "24px", background: "#fff7ed", border: "1px solid #fed7aa" }}>
          <h3 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: "800", color: "#c2410c" }}>
            ⏳ Pending Restaurant Applications ({pendingList.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {pendingList.map((r) => (
              <div key={r.id} style={{ padding: "14px", background: "#ffffff", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <strong style={{ fontSize: "16px", color: "#0f172a" }}>{r.name}</strong> ({r.cuisine || "General"})
                    <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                      Owner: <strong>{r.owner_name}</strong> ({r.owner_email}) • 📞 {r.phone || "N/A"} • 📍 {r.address}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => handleApprove(r.id, 2)} style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                      Reject
                    </button>
                    <button onClick={() => handleApprove(r.id, 1)} style={{ background: "#16a34a", color: "#ffffff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                      ✓ Approve Partner
                    </button>
                    <button onClick={() => handleDelete(r.id)} style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                      Delete
                    </button>
                  </div>
                </div>

                <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", color: "#334155" }}>
                  <strong>📜 Submitted KYC Documents:</strong>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "4px" }}>
                    <div>• PAN: <code>{r.pan_number || "Not provided"}</code></div>
                    <div>• DFTQC License: <code>{r.dftqc_license || "Not provided"}</code></div>
                    <div>• VAT Reg: <code>{r.vat_number || "Not provided"}</code></div>
                  </div>
                  {r.kyc_document && (
                    <div style={{ marginTop: "6px" }}>
                      📎 Attachment: <a href={`http://localhost:5000/uploads/${r.kyc_document}`} target="_blank" rel="noreferrer" style={{ color: "#2563eb", fontWeight: "700" }}>View Uploaded Document →</a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Restaurant Table */}
      <div className="card-box" style={{ padding: "20px" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
          All Approved Restaurants ({activeList.length})
        </h3>

        {activeList.length === 0 ? (
          <p style={{ color: "#64748b" }}>No active restaurants on the platform.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "10px" }}>Restaurant</th>
                <th style={{ padding: "10px" }}>Owner Email</th>
                <th style={{ padding: "10px" }}>Cuisine</th>
                <th style={{ padding: "10px" }}>Status</th>
                <th style={{ padding: "10px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeList.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px" }}>
                    <strong style={{ color: "#0f172a" }}>{r.name}</strong>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>📍 {r.address}</div>
                  </td>
                  <td style={{ padding: "10px" }}>
                    <div style={{ fontWeight: "700" }}>{r.owner_name || "Owner"}</div>
                    <code style={{ fontSize: "12px", color: "#2563eb" }}>{r.owner_email || "N/A"}</code>
                  </td>
                  <td style={{ padding: "10px" }}>{r.cuisine || r.cuisines || "General"}</td>
                  <td style={{ padding: "10px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "800", padding: "3px 8px", borderRadius: "10px", background: r.is_active ? "#dcfce7" : "#fef2f2", color: r.is_active ? "#15803d" : "#991b1b" }}>
                      {r.is_active ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td style={{ padding: "10px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => {
                          setResetRest(r);
                          setNewPassword("password");
                        }}
                        style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "800", cursor: "pointer" }}
                      >
                        🔑 Reset Pass
                      </button>
                      <button onClick={() => handleToggleActive(r.id)} style={{ background: r.is_active ? "#fef2f2" : "#dcfce7", color: r.is_active ? "#dc2626" : "#16a34a", border: "1px solid #cbd5e1", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                        {r.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => handleDelete(r.id)} style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for creating restaurant */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card-box" style={{ width: "450px", padding: "24px", background: "#fff" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "800" }}>Register Restaurant Partner</h3>

            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700" }}>Owner User Account</label>
                <select className="auth-input" value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} style={{ width: "100%", padding: "8px" }}>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email}) [{u.role}]</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700" }}>Restaurant Name *</label>
                <input type="text" className="auth-input" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: "100%", padding: "8px" }} />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700" }}>Address *</label>
                <input type="text" className="auth-input" value={address} onChange={(e) => setAddress(e.target.value)} required style={{ width: "100%", padding: "8px" }} />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700" }}>Cuisine Types</label>
                <input type="text" className="auth-input" placeholder="e.g. Nepali, Biryani, Pizza" value={cuisine} onChange={(e) => setCuisine(e.target.value)} style={{ width: "100%", padding: "8px" }} />
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: "10px" }}>Create Partner</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ padding: "10px" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Reset Password */}
      {resetRest && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card-box" style={{ width: "420px", padding: "24px", background: "#ffffff", borderRadius: "16px" }}>
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: "900", color: "#0f172a" }}>
              🔑 Reset Restaurant Password
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0" }}>
              Setting new password for <strong>{resetRest.name}</strong> (<code>{resetRest.owner_email}</code>)
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
                <button type="button" onClick={() => setResetRest(null)} className="btn-secondary" style={{ padding: "10px 16px" }}>
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

export default AdminRestaurants;
