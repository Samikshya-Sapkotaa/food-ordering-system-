import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const IMG_BASE = "http://localhost:5000/uploads/";

const CATEGORY_ICONS = {
  starters: "🥗",
  "main course": "🍛",
  "pizza & burger": "🍕",
  beverages: "🥤",
  desserts: "🍮",
};
function getCatIcon(name) {
  return CATEGORY_ICONS[name?.toLowerCase()] ?? "🍽️";
}

function Checkout() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [address, setAddress]       = useState(user?.address || "");
  const [phone, setPhone]           = useState(user?.phone || "");
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [notes, setNotes]           = useState("");

  const [items, setItems]           = useState([]);
  const [total, setTotal]           = useState(0);
  const [error, setError]           = useState("");
  const [placing, setPlacing]       = useState(false);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    try {
      const res = await api.get("/cart");
      setItems(res.data.items);
      setTotal(res.data.total);

      if (res.data.items.length === 0) {
        navigate("/cart");
      }
    } catch (err) {
    }
    setLoading(false);
  }

  async function placeOrder(e) {
    e.preventDefault();
    setError("");
    setPlacing(true);

    try {
      const res = await api.post("/orders", {
        address,
        phone,
        payment_method: paymentMethod,
        notes,
      });
      const orderCount = Array.isArray(res.data.orderIds) ? res.data.orderIds.length : 1;
      showToast(`🎉 ${orderCount} order${orderCount > 1 ? "s" : ""} placed successfully!`);
      navigate("/orders");
    } catch (err) {
      const msg = err.response?.data?.message || "Could not place order";
      setError(msg);
      showToast(msg, "error");
      setPlacing(false);
    }
  }

  if (loading) {
    return <Loader text="Loading checkout details…" />;
  }

  const subtotal = Number(total);
  const deliveryFee = subtotal > 500 ? 0 : 40;
  const grandTotal = subtotal + deliveryFee;
  const totalItemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="co-page">

      {/* ── HEADER & STEPPER ─────────────────────────────────── */}
      <div className="co-header">
        <div className="co-header-left">
          <span className="co-header-icon">💳</span>
          <div>
            <h2 className="co-title">Checkout</h2>
            <p className="co-subtitle">Complete your delivery address and payment</p>
          </div>
        </div>

        <Link to="/cart" className="co-back-link">
          ← Back to Cart
        </Link>
      </div>

      {/* Checkout Stepper Bar */}
      <div className="co-stepper">
        <div className="co-step completed">
          <span className="co-step-num">✓</span>
          <span className="co-step-name">1. Cart</span>
        </div>
        <div className="co-step-line active" />
        <div className="co-step active">
          <span className="co-step-num">2</span>
          <span className="co-step-name">2. Delivery & Payment</span>
        </div>
        <div className="co-step-line" />
        <div className="co-step">
          <span className="co-step-num">3</span>
          <span className="co-step-name">3. Confirmation</span>
        </div>
      </div>

      {error && <div className="co-error-banner">⚠️ {error}</div>}

      {/* ── MAIN CONTENT GRID ────────────────────────────────── */}
      <form onSubmit={placeOrder} className="co-grid">

        {/* ── LEFT: DELIVERY & PAYMENT FORM ──────────────────── */}
        <div className="co-form-col">

          {/* Section 1: Delivery Address */}
          <div className="co-section-card">
            <div className="co-section-head">
              <span className="co-sec-icon">📍</span>
              <div>
                <h3 className="co-sec-title">Delivery Address</h3>
                <p className="co-sec-sub">Where should we deliver your hot food?</p>
              </div>
            </div>

            <div className="co-form-group">
              <label className="co-label" htmlFor="delivery-address">
                Full Street Address *
              </label>
              <textarea
                id="delivery-address"
                className="co-input co-textarea"
                rows="3"
                placeholder="Flat / House No., Building Name, Street, Landmark, City..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="co-form-group">
              <label className="co-label" htmlFor="phone-number">
                Contact Phone Number *
              </label>
              <div className="co-phone-wrap">
                <span className="co-phone-prefix">🇳🇵 +977</span>
                <input
                  id="phone-number"
                  className="co-input co-phone-input"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="co-form-group">
              <label className="co-label" htmlFor="delivery-notes">
                Delivery Instructions (Optional)
              </label>
              <input
                id="delivery-notes"
                className="co-input"
                type="text"
                placeholder="e.g. Ring the bell, leave at door, call on arrival..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="co-section-card">
            <div className="co-section-head">
              <span className="co-sec-icon">💵</span>
              <div>
                <h3 className="co-sec-title">Payment Method</h3>
                <p className="co-sec-sub">Select your preferred Nepali payment option</p>
              </div>
            </div>

            <div className="co-payment-options">

              {/* Cash on Delivery */}
              <label
                className={`co-pay-card ${paymentMethod === "Cash on Delivery" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="Cash on Delivery"
                  checked={paymentMethod === "Cash on Delivery"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="co-pay-icon">💵</span>
                <div className="co-pay-details">
                  <span className="co-pay-name">Cash on Delivery (COD)</span>
                  <span className="co-pay-desc">Pay cash when your order arrives at your door</span>
                </div>
                <span className="co-pay-badge recommended">Popular</span>
              </label>

              {/* eSewa Wallet */}
              <label
                className={`co-pay-card ${paymentMethod === "eSewa Wallet" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="eSewa Wallet"
                  checked={paymentMethod === "eSewa Wallet"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="co-pay-icon esewa-icon">🟩</span>
                <div className="co-pay-details">
                  <span className="co-pay-name">eSewa Digital Wallet</span>
                  <span className="co-pay-desc">Fast & secure payment via eSewa App</span>
                </div>
                <span className="co-pay-badge instant">Instant</span>
              </label>

              {/* Khalti Wallet */}
              <label
                className={`co-pay-card ${paymentMethod === "Khalti Wallet" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="Khalti Wallet"
                  checked={paymentMethod === "Khalti Wallet"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="co-pay-icon khalti-icon">🟣</span>
                <div className="co-pay-details">
                  <span className="co-pay-name">Khalti Digital Wallet</span>
                  <span className="co-pay-desc">Pay instantly using Khalti Account</span>
                </div>
                <span className="co-pay-badge instant">Instant</span>
              </label>

              {/* ConnectIPS / Mobile Banking */}
              <label
                className={`co-pay-card ${paymentMethod === "Mobile Banking / ConnectIPS" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="Mobile Banking / ConnectIPS"
                  checked={paymentMethod === "Mobile Banking / ConnectIPS"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="co-pay-icon">🏦</span>
                <div className="co-pay-details">
                  <span className="co-pay-name">Mobile Banking / ConnectIPS</span>
                  <span className="co-pay-desc">All Nepali Commercial & Development Banks</span>
                </div>
              </label>

            </div>
          </div>

        </div>

        {/* ── RIGHT: SUMMARY & PLACE ORDER SIDEBAR ────────────── */}
        <div className="co-summary-col">
          <div className="co-summary-card">
            <h3 className="co-summary-title">Order Items ({totalItemCount})</h3>

            {/* Item Mini List */}
            <div className="co-mini-items">
              {items.map((item) => (
                <div className="co-mini-item" key={item.id}>
                  <div className="co-mini-img-wrap">
                    {item.image ? (
                      <img src={item.image.startsWith("http") ? item.image : IMG_BASE + item.image} alt={item.name} className="co-mini-img" />
                    ) : (
                      <span className="co-mini-emoji">{getCatIcon(item.category_name)}</span>
                    )}
                  </div>
                  <div className="co-mini-info">
                    <span className="co-mini-name">{item.name}</span>
                    <span className="co-mini-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="co-mini-subtotal">Rs. {(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <div className="co-summary-divider" />

            {/* Price Calculations */}
            <div className="co-summary-rows">
              <div className="co-summary-row">
                <span>Items Subtotal</span>
                <span>Rs. {subtotal.toFixed(0)}</span>
              </div>

              <div className="co-summary-row">
                <span>Delivery Charge</span>
                {deliveryFee === 0 ? (
                  <span className="co-free-tag">FREE</span>
                ) : (
                  <span>Rs. {deliveryFee}</span>
                )}
              </div>
            </div>

            <div className="co-summary-divider" />

            <div className="co-summary-row co-grand-total">
              <span>Amount Payable</span>
              <span className="co-total-amount">Rs. {grandTotal.toFixed(0)}</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="co-place-btn"
              disabled={placing}
            >
              {placing ? (
                <>
                  <span className="co-btn-spinner" />
                  Placing Order…
                </>
              ) : (
                `Confirm & Place Order • Rs. ${grandTotal.toFixed(0)}`
              )}
            </button>

            {/* Security Guarantee */}
            <div className="co-security-badge">
              <span>🔒</span> Guaranteed 100% Safe & Secure Order
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}

export default Checkout;
