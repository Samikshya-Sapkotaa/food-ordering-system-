import { useState, useEffect } from "react";
import api from "../api";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";

function SupportPage() {
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [compRes, orderRes] = await Promise.all([
        api.get("/complaints/my"),
        api.get("/orders/my"),
      ]);
      setComplaints(compRes.data);
      setOrders(orderRes.data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!subject || !description) {
      showToast("Subject and description are required", "error");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/complaints", {
        subject,
        description,
        order_id: orderId ? Number(orderId) : null,
      });
      showToast("Complaint submitted. Support will look into it.", "success");
      setSubject("");
      setDescription("");
      setOrderId("");
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to submit complaint", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loader />;

  return (
    <div style={{ maxWidth: "800px", margin: "30px auto" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", marginBottom: "6px" }}>
        💬 Customer Support & Complaints
      </h2>
      <p style={{ color: "#64748b", marginBottom: "24px", fontSize: "14px" }}>
        Need help with an order or service? Submit a complaint ticket below.
      </p>

      {/* New Complaint Form */}
      <div className="card-box" style={{ padding: "24px", marginBottom: "30px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a", margin: "0 0 16px 0" }}>
          Submit New Support Ticket
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
              Related Order (Optional)
            </label>
            <select
              className="auth-input"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
            >
              <option value="">General Inquiry (No Order)</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  Order #{o.id} — Rs. {o.total_amount} ({o.status})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
              Subject
            </label>
            <input
              type="text"
              className="auth-input"
              placeholder="e.g. Food delivered cold / Wrong items received"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              required
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
              Description / Details
            </label>
            <textarea
              className="auth-input"
              rows={4}
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              required
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary" style={{ padding: "10px 24px", fontSize: "14px", fontWeight: "800" }}>
            {submitting ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
      </div>

      {/* Ticket History */}
      <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", marginBottom: "16px" }}>
        Your Ticket History ({complaints.length})
      </h3>

      {complaints.length === 0 ? (
        <div className="card-box" style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
          No support tickets created yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {complaints.map((c) => (
            <div key={c.id} className="card-box" style={{ padding: "16px", borderLeft: `4px solid ${c.status === "Resolved" ? "#16a34a" : "#eab308"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <strong style={{ fontSize: "15px", color: "#0f172a" }}>{c.subject}</strong>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "800",
                    padding: "3px 10px",
                    borderRadius: "12px",
                    background: c.status === "Resolved" ? "#dcfce7" : "#fef9c3",
                    color: c.status === "Resolved" ? "#15803d" : "#a16207",
                  }}
                >
                  {c.status}
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "#475569", margin: "0 0 8px 0" }}>{c.description}</p>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                {c.order_id && <span>Order #{c.order_id} • </span>}
                Submitted on {new Date(c.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SupportPage;
