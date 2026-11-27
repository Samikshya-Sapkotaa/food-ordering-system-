import React, { useState, useEffect } from "react";

function LiveMapTracker({ stepIndex = 3 }) {
  // Animated Delivery position % along route
  const [DeliveryProgress, setDeliveryProgress] = useState(30);

  useEffect(() => {
    // Progress smoothly based on tracking stepIndex
    const targetProgress = Math.min(100, Math.max(15, (stepIndex / 6) * 100));
    const timer = setTimeout(() => {
      setDeliveryProgress(targetProgress);
    }, 400);
    return () => clearTimeout(timer);
  }, [stepIndex]);

  return (
    <div
      style={{
        background: "#0f172a",
        borderRadius: "16px",
        height: "320px",
        position: "relative",
        overflow: "hidden",
        border: "1px solid #334155",
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "16px"
      }}
    >
      {/* Top Map Label */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <div style={{ background: "rgba(15, 23, 42, 0.8)", color: "#ffffff", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
          <span>LIVE GPS ROUTE • KATHMANDU VALLEY</span>
        </div>
        <div style={{ background: "rgba(255,255,255,0.1)", color: "#38bdf8", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>
          Estimated Delivery: 18 mins
        </div>
      </div>

      {/* Simulated Map Grid Roads */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.15,
          backgroundImage: "radial-gradient(#38bdf8 1px, transparent 1px)",
          backgroundSize: "20px 20px"
        }}
      />

      {/* Route SVG Line */}
      <svg
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 2 }}
        viewBox="0 0 500 300"
      >
        <path
          d="M 60 220 Q 200 80 440 180"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="8 6"
        />
      </svg>

      {/* Restaurant Pin */}
      <div
        style={{
          position: "absolute",
          left: "50px",
          top: "200px",
          zIndex: 5,
          background: "#ea580c",
          color: "#ffffff",
          padding: "6px 10px",
          borderRadius: "10px",
          fontSize: "12px",
          fontWeight: "800",
          boxShadow: "0 4px 12px rgba(234, 88, 12, 0.4)"
        }}
      >
        🍳 Restaurant: Kathmandu MoMo Hub
      </div>

      {/* Animated Delivery Marker */}
      <div
        style={{
          position: "absolute",
          left: `${Math.min(82, 10 + DeliveryProgress * 0.72)}%`,
          top: `${Math.min(75, 65 - Math.sin((DeliveryProgress / 100) * Math.PI) * 35)}%`,
          zIndex: 8,
          transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: "translate(-50%, -50%)"
        }}
      >
        <div
          style={{
            background: "#22c55e",
            color: "#ffffff",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            boxShadow: "0 0 0 8px rgba(34, 197, 94, 0.25), 0 6px 16px rgba(0,0,0,0.3)"
          }}
        >
          🛵
        </div>
      </div>

      {/* Delivery Destination Pin */}
      <div
        style={{
          position: "absolute",
          right: "40px",
          top: "160px",
          zIndex: 5,
          background: "#0284c7",
          color: "#ffffff",
          padding: "6px 10px",
          borderRadius: "10px",
          fontSize: "12px",
          fontWeight: "800",
          boxShadow: "0 4px 12px rgba(2, 132, 199, 0.4)"
        }}
      >
        🏠 Delivery: Flat 4B, Durbar Marg
      </div>
    </div>
  );
}

export default LiveMapTracker;
