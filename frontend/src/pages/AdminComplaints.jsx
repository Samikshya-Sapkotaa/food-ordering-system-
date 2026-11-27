import { useState, useEffect } from "react";
import api from "../api";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";

function AdminComplaints() {
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    try {
      const res = await api.get("/complaints/all");
      setComplaints(res.data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }

  async function handleResolve(id) {
    try {
      await api.put(`/complaints/${id}/resolve`);
      showToast("Complaint marked as resolved!", "success");
      loadComplaints();
    } catch (err) {
      showToast("Failed to resolve complaint", "error");
    }
  }

  if (loading) return <Loader text="Loading complaints..." />;

  const openTickets = complaints.filter((c) => c.status === "Open");
  const resolvedTickets = complaints.filter((c) => c.status === "Resolved");

  return (
    <div style={{ maxWidth: "1000px", margin: "30px auto" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", marginBottom: "6px" }}>
        🚨 Customer Complaints & Support Helpdesk
      </h2>
      <p style={{ color: "#64748b", margin: "0 0 24px 0", fontSize: "14px" }}>
        Review customer feedback, issue resolutions, and mark tickets as resolved.
      </p>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div className="card-box" style={{ padding: "16px", borderLeft: "4px solid #eab308" }}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>Open Support Tickets</span>
          <div style={{ fontSize: "24px", fontWeight: "900", color: "#d97706" }}>{openTickets.length}</div>
        </div>

        <div className="card-box" style={{ padding: "16px", borderLeft: "4px solid #16a34a" }}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>Resolved Tickets</span>
          <div style={{ fontSize: "24px", fontWeight: "900", color: "#16a34a" }}>{resolvedTickets.length}</div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="card-box" style={{ padding: "20px" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
          All Submitted Tickets ({complaints.length})
        </h3>

        {complaints.length === 0 ? (
          <p style={{ color: "#64748b" }}>No complaints submitted.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {complaints.map((c) => (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <strong style={{ fontSize: "15px", color: "#0f172a" }}>{c.subject}</strong>
                    <span style={{ fontSize: "11px", fontWeight: "800", padding: "2px 8px", borderRadius: "10px", background: c.status === "Resolved" ? "#dcfce7" : "#fef9c3", color: c.status === "Resolved" ? "#15803d" : "#a16207" }}>
                      {c.status}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#475569", margin: "4px 0 8px 0" }}>{c.description}</p>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Customer: <strong>{c.customer_name}</strong> ({c.customer_email}) {c.order_id && `• Order #${c.order_id}`} • {new Date(c.created_at).toLocaleString()}
                  </div>
                </div>

                {c.status === "Open" && (
                  <button onClick={() => handleResolve(c.id)} style={{ background: "#16a34a", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer", flexShrink: 0 }}>
                    ✓ Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminComplaints;
