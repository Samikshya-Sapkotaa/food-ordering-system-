import React, { useState } from "react";
import { useCustomer } from "../../context/CustomerContext";

const ISSUE_CATEGORIES = [
  { id: "Missing Item", icon: "📦", title: "Item Missing in Order" },
  { id: "Wrong Item", icon: "🍱", title: "Received Wrong Item" },
  { id: "Food Quality", icon: "🍲", title: "Food Quality / Hygiene Issue" },
  { id: "Order Delayed", icon: "⏱️", title: "Order Significantly Delayed" },
  { id: "Payment Issue", icon: "💳", title: "Double Charged / Payment Error" },
  { id: "Other", icon: "💬", title: "Other Issue" }
];

function FoodieSupportPage() {
  const { supportTickets, submitSupportTicket } = useCustomer();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [description, setDescription] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCategory || !description.trim()) return;
    submitSupportTicket("#ORD-9421", selectedCategory, description);
    setSuccessMsg(`Ticket submitted for "${selectedCategory}". Our team will respond within 24 hours.`);
    setDescription("");
    setSelectedCategory(null);
  };

  return (
    <div className="fc-page-content">
      <h1 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", margin: "0 0 6px" }}>💬 Help & Support</h1>
      <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "24px" }}>Select an issue to connect with the Foodie Corner support team.</p>

      {successMsg && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", padding: "14px 18px", borderRadius: "12px", marginBottom: "22px", fontWeight: "700", fontSize: "13px" }}>
          ✅ {successMsg}
        </div>
      )}

      {/* Category Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px", marginBottom: "28px" }}>
        {ISSUE_CATEGORIES.map((cat) => (
          <div key={cat.id} onClick={() => setSelectedCategory(cat.id)} style={{ 
            background: selectedCategory === cat.id ? "#fff7ed" : "#fff", 
            borderRadius: "14px", 
            border: "2px solid", 
            borderColor: selectedCategory === cat.id ? "#ea580c" : "#e2e8f0", 
            padding: "18px 16px", 
            cursor: "pointer", 
            transition: "all 0.15s" 
          }}>
            <div style={{ fontSize: "30px", marginBottom: "8px" }}>{cat.icon}</div>
            <strong style={{ fontSize: "13px", color: "#0f172a", lineHeight: "1.3", display: "block" }}>{cat.title}</strong>
          </div>
        ))}
      </div>

      {/* Submit Form */}
      {selectedCategory && (
        <form onSubmit={handleSubmit} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px", marginBottom: "28px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", margin: "0 0 12px" }}>
            Report: {selectedCategory}
          </h3>
          <textarea rows={4} placeholder="Describe your issue in detail. E.g.: 'The paneer momo was missing from my order.'" value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13px", fontFamily: "inherit", resize: "vertical", outline: "none", marginBottom: "14px" }} />
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="submit" style={{ background: "#ea580c", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 24px", fontSize: "14px", fontWeight: "900", cursor: "pointer", fontFamily: "inherit" }}>
              Submit Ticket
            </button>
            <button type="button" onClick={() => setSelectedCategory(null)} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "12px 20px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Ticket History */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", margin: "0 0 14px" }}>
          📜 My Support Tickets ({supportTickets.length})
        </h3>
        {supportTickets.length === 0 ? (
          <p style={{ fontSize: "13px", color: "#94a3b8", textAlign: "center", padding: "20px" }}>No tickets submitted yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {supportTickets.map((t) => (
              <div key={t.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "14px 16px", borderRadius: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <strong style={{ fontSize: "13px" }}>{t.id} · {t.category} · Order {t.orderId}</strong>
                  <span style={{ background: t.status === "Resolved" ? "#dcfce7" : t.status === "Under Review" ? "#dbeafe" : "#fef3c7", color: t.status === "Resolved" ? "#15803d" : t.status === "Under Review" ? "#1d4ed8" : "#b45309", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800" }}>
                    {t.status}
                  </span>
                </div>
                <div style={{ fontSize: "12px", color: "#475569" }}>"{t.description}"</div>
                {t.resolution && (
                  <div style={{ marginTop: "8px", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", color: "#15803d" }}>
                    <strong>Resolution:</strong> {t.resolution}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FoodieSupportPage;
