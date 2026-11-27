import React, { useState } from "react";
import { useCustomer } from "../../context/CustomerContext";

function FoodieCheckoutPage({ onOrderPlaced }) {
  const { cart, addresses, selectedAddressId, setSelectedAddressId, appliedCoupon, placeOrder } = useCustomer();
  const [tip, setTip] = useState(30);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  const itemTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const deliveryFee = 35;
  const packagingFee = 25;
  const taxes = 28;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = Math.max(0, itemTotal + deliveryFee + packagingFee + taxes + tip - discount);
  const activeAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  const handlePlace = (e) => {
    e.preventDefault();
    const orderId = placeOrder(activeAddress?.text, paymentMethod, tip, notes);
    onOrderPlaced(orderId);
  };

  return (
    <div className="fc-page-content">
      <h1 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", marginBottom: "24px" }}>
        💳 Checkout
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 370px", gap: "28px", alignItems: "start" }}>
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Delivery Address */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", margin: "0 0 14px" }}>📍 Delivery Address</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {addresses.map((a) => (
                <div key={a.id} onClick={() => setSelectedAddressId(a.id)} style={{ padding: "14px", borderRadius: "12px", border: "2px solid", borderColor: selectedAddressId === a.id ? "#ea580c" : "#e2e8f0", background: selectedAddressId === a.id ? "#fff7ed" : "#f8fafc", cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    {selectedAddressId === a.id && <span style={{ color: "#ea580c", fontWeight: "900" }}>✓</span>}
                    <strong style={{ fontSize: "13px" }}>{a.type}</strong>
                    {a.isDefault && <span style={{ background: "#dcfce7", color: "#15803d", fontSize: "10px", fontWeight: "800", padding: "1px 5px", borderRadius: "4px" }}>Default</span>}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.4" }}>{a.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Instructions */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", margin: "0 0 10px" }}>📝 Delivery Instructions</h3>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Leave at door, ring bell, etc..." style={{ width: "100%", padding: "10px 12px", borderRadius: "9px", border: "1px solid #cbd5e1", fontSize: "13px", fontFamily: "inherit", outline: "none" }} />
          </div>

          {/* Delivery Partner Tip */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", margin: "0 0 4px" }}>🛵 Tip for Delivery Partner</h3>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 12px" }}>100% goes directly to your delivery partner.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              {[0, 20, 30, 50].map((amt) => (
                <button key={amt} onClick={() => setTip(amt)} style={{ flex: 1, padding: "9px", borderRadius: "9px", border: "1.5px solid", borderColor: tip === amt ? "#ea580c" : "#e2e8f0", background: tip === amt ? "#fff7ed" : "#fff", color: tip === amt ? "#ea580c" : "#475569", fontSize: "13px", fontWeight: "800", cursor: "pointer", fontFamily: "inherit" }}>
                  {amt === 0 ? "No Tip" : `Rs. ${amt}`}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", margin: "0 0 14px" }}>💳 Payment Method</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { id: "UPI", icon: "📲", title: "UPI (eSewa / Khalti)", sub: "UPI ID: aarav****@nabilbank" },
                { id: "CARD", icon: "💳", title: "Debit / Credit Card", sub: "Nabil Bank Visa · ending 4821" },
                { id: "COD", icon: "💵", title: "Cash on Delivery", sub: "Pay cash to deliveryPartner at doorstep" }
              ].map((pm) => (
                <label key={pm.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px", borderRadius: "12px", border: "1.5px solid", borderColor: paymentMethod === pm.id ? "#ea580c" : "#e2e8f0", background: paymentMethod === pm.id ? "#fff7ed" : "#f8fafc", cursor: "pointer" }}>
                  <input type="radio" name="pm" checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} style={{ accentColor: "#ea580c" }} />
                  <span style={{ fontSize: "22px" }}>{pm.icon}</span>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>{pm.title}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{pm.sub}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Sticky Bill Summary */}
        <div style={{ position: "sticky", top: "90px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "22px", boxShadow: "0 4px 14px rgba(0,0,0,0.03)" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "900", color: "#0f172a", margin: "0 0 14px", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>📋 Bill Breakdown</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "7px", fontSize: "13px", color: "#64748b", marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Item Total</span><span>Rs. {itemTotal}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Delivery Fee</span><span>Rs. {deliveryFee}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Packaging + VAT (13%)</span><span>Rs. {packagingFee + taxes}</span></div>
            {tip > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: "#0284c7" }}><span>Delivery Partner Tip</span><span>Rs. {tip}</span></div>}
            {discount > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: "#16a34a", fontWeight: "700" }}><span>Coupon Discount</span><span>− Rs. {discount}</span></div>}
          </div>

          <div style={{ borderTop: "2px solid #e2e8f0", paddingTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: "900", color: "#0f172a", marginBottom: "18px" }}>
            <span>Total Payable</span><span>Rs. {finalTotal}</span>
          </div>

          <button onClick={handlePlace} style={{ width: "100%", background: "linear-gradient(135deg,#16a34a,#15803d)", color: "#fff", border: "none", borderRadius: "14px", padding: "16px", fontSize: "16px", fontWeight: "900", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(22,163,74,0.3)" }}>
            ✓ Place Order & Track Live →
          </button>
        </div>
      </div>
    </div>
  );
}

export default FoodieCheckoutPage;
