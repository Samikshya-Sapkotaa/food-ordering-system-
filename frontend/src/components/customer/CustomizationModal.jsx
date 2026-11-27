import React, { useState } from "react";

function CustomizationModal({ isOpen, item, onConfirm, onClose }) {
  const [size, setSize] = useState("Full (10 pcs)");
  const [spice, setSpice] = useState("Medium Spicy");
  const [extraCheese, setExtraCheese] = useState(false);

  if (!isOpen || !item) return null;

  const handleConfirm = () => {
    const custom = {
      size,
      spice,
      addOns: extraCheese ? ["Extra Cheese Dip (Rs 40)"] : []
    };
    onConfirm(item, custom);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.5)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "24px",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
              Customise {item.name}
            </h3>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Rs. {item.price}</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
        </div>

        {/* Portion Size Option */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", fontWeight: "800", color: "#475569", marginBottom: "6px" }}>
            Select Portion Size
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {["Full (10 pcs)", "Half (5 pcs)"].map((sz) => (
              <label
                key={sz}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: size === sz ? "#ea580c" : "#cbd5e1",
                  background: size === sz ? "#fff7ed" : "#f8fafc",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <input type="radio" name="size" checked={size === sz} onChange={() => setSize(sz)} />
                {sz}
              </label>
            ))}
          </div>
        </div>

        {/* Spice Level */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "13px", fontWeight: "800", color: "#475569", marginBottom: "6px" }}>
            Spice Level
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {["Mild Spice", "Medium Spicy", "Extra Hot 🔥"].map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => setSpice(sp)}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "700",
                  border: "1px solid",
                  borderColor: spice === sp ? "#ea580c" : "#cbd5e1",
                  background: spice === sp ? "#ea580c" : "#ffffff",
                  color: spice === sp ? "#ffffff" : "#334155",
                  cursor: "pointer"
                }}
              >
                {sp}
              </button>
            ))}
          </div>
        </div>

        {/* Add-ons */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}>
            <input type="checkbox" checked={extraCheese} onChange={(e) => setExtraCheese(e.target.checked)} />
            <span>Add Extra Spicy Sesame Chutney & Cheese Dip (+Rs. 40)</span>
          </label>
        </div>

        <button
          onClick={handleConfirm}
          style={{
            width: "100%",
            background: "#ea580c",
            color: "#ffffff",
            border: "none",
            borderRadius: "12px",
            padding: "14px",
            fontSize: "15px",
            fontWeight: "900",
            cursor: "pointer"
          }}
        >
          Add Item to Cart • Rs. {item.price + (extraCheese ? 40 : 0)}
        </button>
      </div>
    </div>
  );
}

export default CustomizationModal;
