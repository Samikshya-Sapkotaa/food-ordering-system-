import React, { useState } from "react";
import { useCustomer } from "../../context/CustomerContext";

function CustomizationModal({ isOpen, item, onConfirm, onClose }) {
  const [size, setSize] = useState("Full (10 pcs)");
  const [spice, setSpice] = useState("Medium Spicy");
  const [extraDip, setExtraDip] = useState(false);

  if (!isOpen || !item) return null;

  const handleConfirm = () => {
    onConfirm(item, { size, spice, addOns: extraDip ? ["Extra Spicy Dip (+Rs.40)"] : [] });
    onClose();
  };

  const totalPrice = item.price + (extraDip ? 40 : 0);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "480px", width: "100%", boxShadow: "0 24px 50px rgba(0,0,0,0.2)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: 0 }}>Customise Order</h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0" }}>{item.name} · Rs. {item.price}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#64748b" }}>✕</button>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Portion Size</div>
          <div style={{ display: "flex", gap: "10px" }}>
            {["Full (10 pcs)", "Half (5 pcs)"].map((sz) => (
              <label key={sz} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1.5px solid", borderColor: size === sz ? "#ea580c" : "#e2e8f0", background: size === sz ? "#fff7ed" : "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "700" }}>
                <input type="radio" name="size" checked={size === sz} onChange={() => setSize(sz)} style={{ accentColor: "#ea580c" }} />
                {sz}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "18px" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Spice Level</div>
          <div style={{ display: "flex", gap: "8px" }}>
            {["Mild", "Medium Spicy", "Extra Hot 🔥"].map((sp) => (
              <button key={sp} type="button" onClick={() => setSpice(sp)} style={{ flex: 1, padding: "9px 6px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", border: "1.5px solid", borderColor: spice === sp ? "#ea580c" : "#e2e8f0", background: spice === sp ? "#ea580c" : "#fff", color: spice === sp ? "#fff" : "#475569", cursor: "pointer", fontFamily: "inherit" }}>
                {sp}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "22px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", fontWeight: "700", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", background: extraDip ? "#fff7ed" : "#f8fafc" }}>
            <input type="checkbox" checked={extraDip} onChange={(e) => setExtraDip(e.target.checked)} style={{ width: "16px", height: "16px", accentColor: "#ea580c" }} />
            <span>Extra Spicy Sesame Dip + Rs. 40</span>
          </label>
        </div>

        <button onClick={handleConfirm} style={{ width: "100%", background: "#ea580c", color: "#fff", border: "none", borderRadius: "12px", padding: "14px", fontSize: "15px", fontWeight: "900", cursor: "pointer", fontFamily: "inherit" }}>
          Add to Cart · Rs. {totalPrice}
        </button>
      </div>
    </div>
  );
}

function FoodieMenuPage({ restaurant, onProceedCheckout }) {
  const { menuCategories, cart, addToCart, updateCartQty } = useCustomer();
  const [customizingItem, setCustomizingItem] = useState(null);

  if (!restaurant) return null;

  const itemTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const getQty = (id) => (cart.find((i) => i.id === id)?.qty || 0);

  const handleAdd = (item) => {
    if (item.customizable) setCustomizingItem(item);
    else addToCart(item);
  };

  return (
    <div className="fc-page-content">
      {/* Restaurant Header */}
      <div style={{ background: "#fff", borderRadius: "20px", border: "1px solid #e2e8f0", padding: "24px 28px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#0f172a", margin: "0 0 6px" }}>{restaurant.name}</h1>
          <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "10px" }}>{restaurant.cuisine} · 📍 {restaurant.address}</div>
          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <span style={{ background: "#16a34a", color: "#fff", padding: "3px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "800" }}>★ {restaurant.rating}</span>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>⏱ {restaurant.deliveryTime}</span>
            <span style={{ fontSize: "13px", color: "#94a3b8" }}>· {restaurant.costForTwo}</span>
          </div>
        </div>
        <img src={restaurant.image} alt={restaurant.name} style={{ width: "110px", height: "90px", borderRadius: "14px", objectFit: "cover" }} />
      </div>

      {/* 2-Column: Menu (70%) + Cart Panel (30%) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 330px", gap: "24px", alignItems: "start" }}>
        {/* Menu */}
        <div>
          {menuCategories.map((cat, idx) => (
            <div key={idx} style={{ marginBottom: "36px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", paddingBottom: "10px", borderBottom: "2px solid #f1f5f9", marginBottom: "18px" }}>
                {cat.name} <span style={{ fontSize: "13px", fontWeight: "600", color: "#94a3b8" }}>({cat.items.length} items)</span>
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {cat.items.map((item) => {
                  const qty = getQty(item.id);
                  return (
                    <div key={item.id} style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "18px 20px", display: "flex", justifyContent: "space-between", gap: "20px", alignItems: "center", transition: "box-shadow 0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.06)"}
                      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          {/* Veg/Non-Veg badge */}
                          <span style={{ width: "16px", height: "16px", border: `1.5px solid ${item.veg ? "#16a34a" : "#dc2626"}`, borderRadius: "3px", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: item.veg ? "#16a34a" : "#dc2626", display: "block" }} />
                          </span>
                          <strong style={{ fontSize: "15px", color: "#0f172a" }}>{item.name}</strong>
                        </div>
                        <div style={{ fontSize: "15px", fontWeight: "800", color: "#334155", marginBottom: "5px" }}>Rs. {item.price}</div>
                        <p style={{ fontSize: "12px", color: "#64748b", margin: 0, lineHeight: "1.5", maxWidth: "480px" }}>{item.description}</p>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", position: "relative" }}>
                        <img src={item.image} alt={item.name} style={{ width: "96px", height: "80px", borderRadius: "10px", objectFit: "cover" }} />
                        {qty === 0 ? (
                          <button onClick={() => handleAdd(item)} style={{ background: "#fff", color: "#16a34a", border: "1.5px solid #16a34a", borderRadius: "8px", padding: "6px 20px", fontSize: "13px", fontWeight: "900", cursor: "pointer", boxShadow: "0 3px 10px rgba(0,0,0,0.08)", fontFamily: "inherit" }}>
                            ADD {item.customizable ? "+" : ""}
                          </button>
                        ) : (
                          <div style={{ background: "#16a34a", color: "#fff", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px", padding: "5px 10px", boxShadow: "0 3px 10px rgba(22,163,74,0.3)" }}>
                            <button onClick={() => updateCartQty(item.id, -1)} style={{ background: "none", border: "none", color: "#fff", fontWeight: "900", cursor: "pointer", fontSize: "16px", lineHeight: 1 }}>−</button>
                            <span style={{ fontWeight: "800", fontSize: "14px" }}>{qty}</span>
                            <button onClick={() => updateCartQty(item.id, 1)} style={{ background: "none", border: "none", color: "#fff", fontWeight: "900", cursor: "pointer", fontSize: "16px", lineHeight: 1 }}>+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right Sticky Cart Panel */}
        <div style={{ position: "sticky", top: "90px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", margin: "0 0 14px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
            🛒 Cart ({cart.reduce((s, i) => s + i.qty, 0)} items)
          </h3>

          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8" }}>
              <span style={{ fontSize: "36px", display: "block", marginBottom: "8px" }}>🍽️</span>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#475569" }}>Cart is empty</div>
              <p style={{ fontSize: "11px", marginTop: "4px" }}>Add items to start your order.</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "14px", maxHeight: "260px", overflowY: "auto" }}>
                {cart.map((i) => (
                  <div key={i.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
                    <div>
                      <span style={{ fontWeight: "700" }}>{i.name}</span>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>× {i.qty}</div>
                    </div>
                    <strong>Rs. {i.price * i.qty}</strong>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: "900", marginBottom: "14px" }}>
                <span>Subtotal</span><span>Rs. {itemTotal}</span>
              </div>
              <button onClick={onProceedCheckout} style={{ width: "100%", background: "linear-gradient(135deg,#ea580c,#c2410c)", color: "#fff", border: "none", borderRadius: "12px", padding: "13px", fontSize: "14px", fontWeight: "900", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(234,88,12,0.3)" }}>
                Proceed to Checkout →
              </button>
            </>
          )}
        </div>
      </div>

      <CustomizationModal isOpen={Boolean(customizingItem)} item={customizingItem} onConfirm={(item, custom) => addToCart(item, custom)} onClose={() => setCustomizingItem(null)} />
    </div>
  );
}

export default FoodieMenuPage;
