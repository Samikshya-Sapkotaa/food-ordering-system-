import React, { useState } from "react";
import { useCustomer } from "../../context/CustomerContext";

function FoodieTrackingPage({ onNavigateSupport }) {
  const { activeOrder, simulateOrderStep } = useCustomer();
  const [showSupportModal, setShowSupportModal] = useState(false);

  if (!activeOrder) return null;

  const steps = [
    { label: "Order Placed", desc: "Order sent to restaurant", icon: "📋" },
    { label: "Accepted", desc: "Restaurant confirmed your order", icon: "✅" },
    { label: "Preparing", desc: "Kitchen is cooking your food", icon: "🍳" },
    { label: "Delivery Assigned", desc: "Delivery partner assigned", icon: "🛵" },
    { label: "Picked Up", desc: "Food packed and collected", icon: "📦" },
    { label: "Out for Delivery", desc: "Partner is on the way!", icon: "🚀" },
    { label: "Delivered", desc: "Order delivered successfully", icon: "🎉" }
  ];

  const progress = Math.min(100, (activeOrder.stepIndex / 6) * 100);

  return (
    <div className="fc-page-content">
      {/* Header */}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "18px 24px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ background: "#dcfce7", color: "#15803d", fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "6px", textTransform: "uppercase" }}>
            🔴 Live Order Tracker
          </span>
          <h1 style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", margin: "6px 0 0" }}>
            Order {activeOrder.orderId}
          </h1>
        </div>
        <button onClick={simulateOrderStep} style={{ background: "#ea580c", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 18px", fontSize: "13px", fontWeight: "800", cursor: "pointer", fontFamily: "inherit" }}>
          ⚡ Simulate Next Step
        </button>
      </div>

      {/* 2-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px", alignItems: "start" }}>
        {/* Left: Map */}
        <div>
          {/* Animated Map */}
          <div style={{ background: "#0f172a", borderRadius: "16px", height: "300px", position: "relative", overflow: "hidden", border: "1px solid #334155", marginBottom: "20px" }}>
            {/* Grid background */}
            <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: "radial-gradient(#38bdf8 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            {/* Route line */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 500 280">
              <path d="M 60 210 Q 200 80 440 170" fill="none" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" strokeDasharray="8 5" />
            </svg>
            {/* Labels */}
            <div style={{ position: "absolute", bottom: "12px", left: "12px", zIndex: 5, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(4px)", color: "#fff", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "800" }}>
              🟢 LIVE GPS · KATHMANDU VALLEY
            </div>
            <div style={{ position: "absolute", top: "12px", right: "12px", background: "#0284c7", color: "#fff", padding: "5px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>
              ETA: 18 mins
            </div>
            {/* Restaurant pin */}
            <div style={{ position: "absolute", left: "44px", top: "185px", zIndex: 5, background: "#ea580c", color: "#fff", padding: "5px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "800", boxShadow: "0 4px 10px rgba(234,88,12,0.4)" }}>
              🍳 Restaurant
            </div>
            {/* Animated Delivery */}
            <div style={{
              position: "absolute",
              left: `${Math.min(80, 10 + progress * 0.7)}%`,
              top: `${Math.max(20, 62 - Math.sin((progress / 100) * Math.PI) * 30)}%`,
              zIndex: 8,
              transform: "translate(-50%, -50%)",
              transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)"
            }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", boxShadow: "0 0 0 8px rgba(34,197,94,0.2), 0 4px 16px rgba(0,0,0,0.3)" }}>🛵</div>
            </div>
            {/* Delivery pin */}
            <div style={{ position: "absolute", right: "36px", top: "150px", zIndex: 5, background: "#0284c7", color: "#fff", padding: "5px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "800", boxShadow: "0 4px 10px rgba(2,132,199,0.4)" }}>
              🏠 Your Location
            </div>
          </div>

          {/* Delivery Card */}
          {activeOrder.Delivery && (
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <img src={activeOrder.Delivery.photo} alt="" style={{ width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>🛵 {activeOrder.Delivery.name}</div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>⭐ {activeOrder.Delivery.rating} · {activeOrder.Delivery.vehicle}</div>
                </div>
              </div>
              <a href={`tel:${activeOrder.Delivery.phone}`} style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "9px", padding: "9px 16px", fontSize: "13px", fontWeight: "700", textDecoration: "none", color: "#334155" }}>
                📞 Call Partner
              </a>
            </div>
          )}
        </div>

        {/* Right: Stepper */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", margin: "0 0 18px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
            ⏱ Delivery Progress
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {steps.map((st, idx) => {
              const done = idx <= activeOrder.stepIndex;
              const current = idx === activeOrder.stepIndex;
              return (
                <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                    background: done ? "#16a34a" : "#f1f5f9",
                    color: done ? "#fff" : "#94a3b8",
                    fontSize: done ? "12px" : "11px",
                    fontWeight: "800",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: current ? "0 0 0 3px rgba(22,163,74,0.2)" : "none"
                  }}>
                    {done ? "✓" : idx + 1}
                  </div>
                  <div style={{ paddingTop: "2px" }}>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: current ? "#0284c7" : done ? "#0f172a" : "#94a3b8" }}>
                      {st.icon} {st.label} {current && <span style={{ fontSize: "11px", background: "#dbeafe", color: "#1d4ed8", padding: "1px 6px", borderRadius: "4px" }}>Active</span>}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{st.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={() => setShowSupportModal(true)} style={{ width: "100%", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "11px", fontSize: "13px", fontWeight: "800", cursor: "pointer", marginTop: "20px", color: "#334155", fontFamily: "inherit" }}>
            ❓ Need Help with this Order?
          </button>
        </div>
      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }} onClick={() => setShowSupportModal(false)}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "440px", width: "100%" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontWeight: "900", margin: "0 0 14px" }}>❓ Order Help</h3>
            <p style={{ fontSize: "13px", color: "#64748b" }}>For issues with Order {activeOrder.orderId}, please use our support page for fastest resolution.</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button onClick={() => { setShowSupportModal(false); onNavigateSupport(); }} style={{ flex: 1, background: "#ea580c", color: "#fff", border: "none", borderRadius: "10px", padding: "12px", fontWeight: "800", cursor: "pointer", fontFamily: "inherit" }}>
                Go to Support
              </button>
              <button onClick={() => setShowSupportModal(false)} style={{ flex: 1, background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "12px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FoodieTrackingPage;
