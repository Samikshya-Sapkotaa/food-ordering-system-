import React, { useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import ActionReasonModal from "./ActionReasonModal";

function RestaurantManagement() {
  const { restaurants, approveRestaurant, suspendRestaurant, updateCommission } = useAdmin();

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterCity, setFilterCity] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRest, setSelectedRest] = useState(null);
  const [suspendingRestId, setSuspendingRestId] = useState(null);
  const [commissionInput, setCommissionInput] = useState("");

  const pendingQueue = restaurants.filter((r) => r.status === "Pending");

  const filteredRestaurants = restaurants.filter((r) => {
    if (filterStatus !== "ALL" && r.status !== filterStatus) return false;
    if (filterCity !== "ALL" && r.city !== filterCity) return false;
    if (searchTerm && !r.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleOpenDetail = (r) => {
    setSelectedRest(r);
    setCommissionInput(r.commissionPct);
  };

  const handleSaveCommission = (rId) => {
    updateCommission(rId, commissionInput);
    if (selectedRest) {
      setSelectedRest({ ...selectedRest, commissionPct: Number(commissionInput) });
    }
  };

  return (
    <div>
      {/* Onboarding Queue Alert Banner */}
      {pendingQueue.length > 0 && (
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "14px", padding: "16px", marginBottom: "20px" }}>
          <div style={{ fontSize: "14px", fontWeight: "800", color: "#c2410c", marginBottom: "8px" }}>
            📋 Restaurant Onboarding Applications Pending Review ({pendingQueue.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {pendingQueue.map((p) => (
              <div key={p.id} style={{ background: "#ffffff", padding: "12px", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #cbd5e1" }}>
                <div>
                  <strong>{p.name}</strong> ({p.city}) — DFTQC: <code>{p.documents.dftqc}</code> | VAT Reg: <code>{p.documents.vat}</code>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setSuspendingRestId(p.id)}
                    style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => approveRestaurant(p.id)}
                    style={{ background: "#16a34a", color: "#ffffff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                  >
                    ✓ Approve & Activate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="ap-table-card">
        <div className="ap-table-toolbar">
          <input
            type="text"
            className="ap-search-input"
            placeholder="Search restaurant by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <select className="ap-select-filter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>

            <select className="ap-select-filter" value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
              <option value="ALL">All Cities</option>
              <option value="Kathmandu">Kathmandu</option>
              <option value="Lalitpur">Lalitpur</option>
            </select>
          </div>
        </div>

        <table className="ap-table">
          <thead>
            <tr>
              <th>Restaurant</th>
              <th>City</th>
              <th>Status</th>
              <th>Rating</th>
              <th>Orders Today</th>
              <th>Commission %</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRestaurants.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{r.name}</strong>
                </td>
                <td>{r.city}</td>
                <td>
                  <span className={`ap-badge ${r.status === "Active" ? "ap-badge-active" : r.status === "Pending" ? "ap-badge-pending" : "ap-badge-suspended"}`}>
                    {r.status}
                  </span>
                </td>
                <td>{r.rating > 0 ? `${r.rating} ⭐` : "New"}</td>
                <td>{r.ordersToday}</td>
                <td><strong>{r.commissionPct}%</strong></td>
                <td>
                  <button
                    onClick={() => handleOpenDetail(r)}
                    style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                  >
                    View Details & Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail View Drawer */}
      {selectedRest && (
        <div className="ap-drawer-overlay" onClick={() => setSelectedRest(null)}>
          <div className="ap-drawer" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                {selectedRest.name}
              </h2>
              <button onClick={() => setSelectedRest(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}>
                ✕
              </button>
            </div>

            <div style={{ marginBottom: "16px", background: "#f8fafc", padding: "12px", borderRadius: "10px" }}>
              <div><strong>Status:</strong> {selectedRest.status}</div>
              <div><strong>City:</strong> {selectedRest.city}</div>
              <div><strong>Menu Items Count:</strong> {selectedRest.menuCount} dishes (Read-Only)</div>
            </div>

            {/* Verification Documents */}
            <div style={{ marginBottom: "16px" }}>
              <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#475569", textTransform: "uppercase" }}>Onboarding Verification Docs</h4>
              <div style={{ fontSize: "12px", background: "#ffffff", border: "1px solid #e2e8f0", padding: "10px", borderRadius: "8px" }}>
                <div>• DFTQC License: <code>{selectedRest.documents.dftqc}</code></div>
                <div>• VAT Registration: <code>{selectedRest.documents.vat}</code></div>
                <div>• Bank Account: <code>{selectedRest.documents.bankAccount}</code></div>
              </div>
            </div>

            {/* Editable Commission % */}
            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#475569", textTransform: "uppercase" }}>Commission Override</h4>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="number"
                  value={commissionInput}
                  onChange={(e) => setCommissionInput(e.target.value)}
                  style={{ width: "80px", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontWeight: "bold" }}
                />
                <span>% Commission</span>
                <button
                  onClick={() => handleSaveCommission(selectedRest.id)}
                  style={{ background: "#0284c7", color: "#ffffff", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                >
                  Save Commission
                </button>
              </div>
            </div>

            {/* Suspend Action */}
            {selectedRest.status === "Active" && (
              <button
                onClick={() => setSuspendingRestId(selectedRest.id)}
                style={{ width: "100%", background: "#dc2626", color: "#ffffff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}
              >
                🚫 Suspend Restaurant Account
              </button>
            )}

            {selectedRest.suspendReason && (
              <div style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fca5a5", padding: "10px", borderRadius: "8px", fontSize: "12px", marginTop: "12px" }}>
                <strong>Suspension Reason:</strong> {selectedRest.suspendReason}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ActionReasonModal
        isOpen={Boolean(suspendingRestId)}
        title="Suspend / Reject Restaurant"
        promptText="Mandatory reason required (e.g. hygiene complaint, fraud suspicion, restaurant request)."
        actionButtonText="Confirm Suspension"
        onConfirm={(reason) => suspendRestaurant(suspendingRestId, reason)}
        onClose={() => setSuspendingRestId(null)}
      />
    </div>
  );
}

export default RestaurantManagement;
