import React, { useState } from "react";
import { useCustomer } from "../../context/CustomerContext";

const CUISINE_CHIPS = [
  { name: "All", icon: "🍽️" },
  { name: "MoMo", icon: "🥟" },
  { name: "Biryani", icon: "🍲" },
  { name: "Pizza", icon: "🍕" },
  { name: "Burgers", icon: "🍔" },
  { name: "Newari", icon: "🥣" },
  { name: "Coffee & Bakery", icon: "☕" },
  { name: "Desserts", icon: "🍰" },
];

function FoodieHomePage({ onSelectRestaurant }) {
  const { restaurants } = useCustomer();
  const [selectedChip, setSelectedChip] = useState("All");
  const [pureVegOnly, setPureVegOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);

  const filtered = restaurants.filter((r) => {
    if (pureVegOnly && !r.vegOnly) return false;
    if (minRating > 0 && r.rating < minRating) return false;
    if (selectedChip !== "All" && !r.cuisine.toLowerCase().includes(selectedChip.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="fc-page-content">
      {/* Hero Banner */}
      <div style={{
        background: "linear-gradient(135deg, #c2410c 0%, #ea580c 60%, #f97316 100%)",
        color: "#fff",
        borderRadius: "20px",
        padding: "36px 44px",
        marginBottom: "32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 8px 28px rgba(194,65,12,0.25)"
      }}>
        <div>
          <span style={{ background: "rgba(255,255,255,0.2)", padding: "4px 14px", borderRadius: "20px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            🔥 Limited Time Offer
          </span>
          <h1 style={{ fontSize: "36px", fontWeight: "900", margin: "12px 0 6px", lineHeight: 1.1 }}>
            50% OFF up to Rs. 100
          </h1>
          <p style={{ fontSize: "15px", opacity: 0.9, margin: 0 }}>
            Use code <strong>FC50</strong> on your first order · Free delivery over Rs. 300
          </p>
        </div>
        <span style={{ fontSize: "80px" }}>🥟</span>
      </div>

      {/* Cuisine Filter Chips */}
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", marginBottom: "14px" }}>
          What's on your mind?
        </h2>
        <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "6px" }}>
          {CUISINE_CHIPS.map((chip) => (
            <button
              key={chip.name}
              onClick={() => setSelectedChip(chip.name)}
              style={{
                padding: "9px 18px",
                borderRadius: "20px",
                border: "1.5px solid",
                borderColor: selectedChip === chip.name ? "#ea580c" : "#e2e8f0",
                background: selectedChip === chip.name ? "#fff7ed" : "#fff",
                color: selectedChip === chip.name ? "#ea580c" : "#475569",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                whiteSpace: "nowrap",
                fontFamily: "inherit",
                transition: "all 0.15s"
              }}
            >
              <span>{chip.icon}</span>
              <span>{chip.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Sidebar + Restaurant Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: "28px", alignItems: "start" }}>
        {/* Left Sidebar Filters */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", position: "sticky", top: "90px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "900", color: "#0f172a", marginBottom: "18px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            🎛️ Filters
          </h3>

          {/* Pure Veg */}
          <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #f1f5f9" }}>
            <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>🌿 Pure Veg Only</span>
              <div
                onClick={() => setPureVegOnly(!pureVegOnly)}
                style={{
                  width: "40px", height: "22px", borderRadius: "11px",
                  background: pureVegOnly ? "#16a34a" : "#cbd5e1",
                  position: "relative", cursor: "pointer", transition: "background 0.2s"
                }}
              >
                <div style={{
                  position: "absolute", top: "3px",
                  left: pureVegOnly ? "21px" : "3px",
                  width: "16px", height: "16px", borderRadius: "50%", background: "#fff",
                  transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)"
                }} />
              </div>
            </label>
          </div>

          {/* Min Rating */}
          <div>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
              Minimum Rating
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[{ val: 0, label: "All Ratings" }, { val: 4.0, label: "4.0+ Stars ⭐" }, { val: 4.5, label: "4.5+ Stars ⭐" }].map((r) => (
                <button
                  key={r.val}
                  onClick={() => setMinRating(r.val)}
                  style={{
                    padding: "8px 12px", borderRadius: "8px", border: "1.5px solid",
                    borderColor: minRating === r.val ? "#ea580c" : "#e2e8f0",
                    background: minRating === r.val ? "#fff7ed" : "#fff",
                    color: minRating === r.val ? "#ea580c" : "#475569",
                    fontSize: "12px", fontWeight: "700", cursor: "pointer",
                    textAlign: "left", fontFamily: "inherit"
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Restaurant Grid */}
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", marginBottom: "18px" }}>
            Top Restaurants · Kathmandu ({filtered.length})
          </h2>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
              <span style={{ fontSize: "48px", display: "block", marginBottom: "12px" }}>🍽️</span>
              <strong>No restaurants match your filters</strong>
              <p>Try removing some filters to see more options.</p>
            </div>
          ) : (
            <div className="fc-restaurant-grid">
              {filtered.map((rest) => (
                <div key={rest.id} className="fc-rest-card" onClick={() => onSelectRestaurant(rest)}>
                  <div className="fc-rest-img-wrap">
                    <img src={rest.image} alt={rest.name} className="fc-rest-img" />
                    <span className="fc-rest-badge-disc">50% OFF · Min Rs 200</span>
                  </div>
                  <div className="fc-rest-body">
                    <h3 className="fc-rest-name">{rest.name}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "700" }}>
                      <span className="fc-rating-pill">★ {rest.rating}</span>
                      <span style={{ color: "#94a3b8" }}>·</span>
                      <span style={{ color: "#475569" }}>{rest.deliveryTime}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {rest.cuisine}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                      <span>📍 {rest.distance}</span>
                      <span>{rest.costForTwo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FoodieHomePage;
