import React, { useState } from "react";
import { useCustomer } from "../../context/CustomerContext";

function FoodieCartDrawer({ onProceedCheckout }) {
  const { cart, cartOpen, setCartOpen, updateCartQty, applyCoupon, appliedCoupon } = useCustomer();
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");

  if (!cartOpen) return null;

  const itemTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const deliveryFee = 35;
  const packagingFee = 25;
  const taxes = 28;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = Math.max(0, itemTotal + deliveryFee + packagingFee + taxes - discount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const res = applyCoupon(couponCode);
    setCouponMsg(res.message);
  };

  return (
    <div className="fc-cart-drawer-overlay" onClick={() => setCartOpen(false)}>
      <div className="fc-cart-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #e2e8f0", paddingBottom: "14px", flexShrink: 0 }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: 0 }}>🛒 My Cart</h3>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Kathmandu MoMo Hub</span>
          </div>
          <button onClick={() => setCartOpen(false)} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#64748b" }}>✕</button>
        </div>

        {/* Cart Items */}
        {cart.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#64748b", gap: "8px" }}>
            <span style={{ fontSize: "52px" }}>🛒</span>
            <strong style={{ fontSize: "16px", color: "#0f172a" }}>Your Cart is Empty</strong>
            <p style={{ fontSize: "13px", margin: 0 }}>Add dishes from the menu to get started.</p>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
            {cart.map((item) => (
              <div key={item.id} style={{ background: "#f8fafc", padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flex: 1 }}>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>{item.name}</span>
                  </div>
                  <strong style={{ fontSize: "13px", color: "#0f172a", flexShrink: 0 }}>Rs. {item.price * item.qty}</strong>
                </div>

                {item.customization && (
                  <div style={{ fontSize: "11px", color: "#ea580c", fontWeight: "600", marginBottom: "6px" }}>
                    {item.customization.size} · {item.customization.spice}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>Rs. {item.price} each</span>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #cbd5e1", borderRadius: "8px", background: "#ffffff", overflow: "hidden" }}>
                    <button onClick={() => updateCartQty(item.id, -1)} style={{ border: "none", background: "none", padding: "4px 10px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", color: "#ea580c", lineHeight: 1 }}>−</button>
                    <span style={{ fontSize: "13px", fontWeight: "800", padding: "0 6px", minWidth: "16px", textAlign: "center" }}>{item.qty}</span>
                    <button onClick={() => updateCartQty(item.id, 1)} style={{ border: "none", background: "none", padding: "4px 10px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", color: "#ea580c", lineHeight: 1 }}>+</button>
                  </div>
                </div>
              </div>
            ))}

            {/* Coupon Section */}
            <form onSubmit={handleApplyCoupon} style={{ background: "#fff7ed", border: "1px dashed #fed7aa", padding: "12px", borderRadius: "10px", marginTop: "4px" }}>
              <div style={{ fontSize: "12px", fontWeight: "800", color: "#c2410c", marginBottom: "6px" }}>🏷️ Coupon Code</div>
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  type="text"
                  placeholder="Try FC50"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  style={{ flex: 1, padding: "7px 10px", borderRadius: "6px", border: "1px solid #fed7aa", fontSize: "12px", fontFamily: "inherit", outline: "none" }}
                />
                <button type="submit" style={{ background: "#ea580c", color: "#fff", border: "none", padding: "7px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "800", cursor: "pointer", fontFamily: "inherit" }}>
                  Apply
                </button>
              </div>
              {couponMsg && (
                <div style={{ fontSize: "11px", color: appliedCoupon ? "#16a34a" : "#dc2626", marginTop: "5px", fontWeight: "700" }}>
                  {appliedCoupon ? "✓ " : "✗ "}{couponMsg}
                </div>
              )}
            </form>

            {/* Bill Breakdown */}
            <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: "13px", fontWeight: "800", color: "#0f172a", marginBottom: "10px" }}>Bill Summary</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "12px", color: "#64748b" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Item Total</span><span>Rs. {itemTotal}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Delivery Fee</span><span>Rs. {deliveryFee}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>Packaging + VAT (13%)</span><span>Rs. {packagingFee + taxes}</span></div>
                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a", fontWeight: "700" }}>
                    <span>Coupon ({appliedCoupon.code})</span><span>− Rs. {discount}</span>
                  </div>
                )}
                <div style={{ borderTop: "1px solid #cbd5e1", paddingTop: "8px", marginTop: "4px", display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: "900", color: "#0f172a" }}>
                  <span>Grand Total</span><span>Rs. {grandTotal}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer CTA */}
        {cart.length > 0 && (
          <button
            onClick={() => { setCartOpen(false); onProceedCheckout(); }}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "14px",
              padding: "16px",
              fontSize: "15px",
              fontWeight: "900",
              cursor: "pointer",
              marginTop: "16px",
              boxShadow: "0 4px 14px rgba(234,88,12,0.35)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontFamily: "inherit",
              flexShrink: 0
            }}
          >
            <span>Proceed to Checkout</span>
            <span>Rs. {grandTotal} →</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default FoodieCartDrawer;
