import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Loader from "../components/Loader";

/* ── Status metadata ─────────────────────────────────────── */
const STATUS_STEPS = ["Pending", "Confirmed", "Preparing", "Ready for Pickup", "Out for Delivery", "Delivered"];

const STATUS_META = {
  Pending:           { icon: "🕐", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", label: "Pending" },
  Confirmed:         { icon: "✅", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", label: "Confirmed" },
  Preparing:         { icon: "🍳", color: "#d97706", bg: "#fef3c7", border: "#fde68a", label: "Preparing" },
  "Ready for Pickup":{ icon: "📦", color: "#0284c7", bg: "#e0f2fe", border: "#bae6fd", label: "Ready for Pickup" },
  "Out for Delivery":{ icon: "🛵", color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe", label: "Out for Delivery" },
  Delivered:         { icon: "🎉", color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0", label: "Delivered" },
  Cancelled:         { icon: "✕",  color: "#ef4444", bg: "#fef2f2", border: "#fecaca", label: "Cancelled" },
};

function getMeta(status) {
  return STATUS_META[status] ?? STATUS_META["Pending"];
}

/* index of the current status in the progress steps (-1 if Cancelled) */
function stepIndex(status) {
  return STATUS_STEPS.indexOf(status);
}

/* nicely formatted date */
function fmtDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function MyOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({}); // order id → bool

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    try {
      const res = await api.get("/orders/my");
      // auto-expand most recent order
      if (res.data.length > 0) {
        setExpanded({ [res.data[0].id]: true });
      }
      setOrders(res.data);
    } catch (err) {
    }
    setLoading(false);
  }

  function toggle(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  if (loading) return <Loader text="Loading your orders…" />;

  /* ── Empty state ── */
  if (orders.length === 0) {
    return (
      <div className="mo-page">
        <div className="mo-header">
          <span className="mo-header-icon">📦</span>
          <div>
            <h2 className="mo-title">My Orders</h2>
            <p className="mo-subtitle">Track your order history</p>
          </div>
        </div>
        <div className="mo-empty">
          <span className="mo-empty-icon">🛒</span>
          <p className="mo-empty-msg">No orders yet</p>
          <p className="mo-empty-hint">Place your first order from the menu!</p>
          <Link to="/" className="mo-menu-link">Browse Menu →</Link>
        </div>
      </div>
    );
  }

  const totalSpent = orders
    .filter(o => o.status !== "Cancelled")
    .reduce((s, o) => s + parseFloat(o.total_amount), 0);

  return (
    <div className="mo-page">

      {/* ── PAGE HEADER ─────────────────────────────────────── */}
      <div className="mo-header">
        <div className="mo-header-left">
          <span className="mo-header-icon">📦</span>
          <div>
            <h2 className="mo-title">My Orders</h2>
            <p className="mo-subtitle">Track and review all your orders</p>
          </div>
        </div>
        <Link to="/" className="mo-order-more-btn">+ Order More</Link>
      </div>

      {/* ── STAT STRIP ─────────────────────────────────────── */}
      <div className="mo-stat-strip">
        <div className="mo-stat">
          <span className="mo-stat-num">{orders.length}</span>
          <span className="mo-stat-label">Total Orders</span>
        </div>
        <div className="mo-stat-div" />
        <div className="mo-stat">
          <span className="mo-stat-num mo-stat-green">
            {orders.filter(o => o.status === "Delivered").length}
          </span>
          <span className="mo-stat-label">Delivered</span>
        </div>
        <div className="mo-stat-div" />
        <div className="mo-stat">
          <span className="mo-stat-num mo-stat-amber">
            {orders.filter(o => !["Delivered","Cancelled"].includes(o.status)).length}
          </span>
          <span className="mo-stat-label">Active</span>
        </div>
        <div className="mo-stat-div" />
        <div className="mo-stat">
          <span className="mo-stat-num">Rs. {totalSpent.toFixed(0)}</span>
          <span className="mo-stat-label">Total Spent</span>
        </div>
      </div>

      {/* ── ORDER CARDS ─────────────────────────────────────── */}
      <div className="mo-list">
        {orders.map((order, index) => {
          const meta       = getMeta(order.status);
          const isOpen     = !!expanded[order.id];
          const cancelled  = order.status === "Cancelled";
          const stepIdx    = cancelled ? -1 : stepIndex(order.status);

          return (
            <div
              className={`mo-card ${cancelled ? "mo-card-cancelled" : ""}`}
              key={order.id}
              style={{ "--i": index, "--status-color": meta.color }}
            >
              {/* ── Card header (always visible) ── */}
              <div
                className="mo-card-head"
                onClick={() => toggle(order.id)}
                role="button"
                aria-expanded={isOpen}
                id={`order-${order.id}-toggle`}
              >
                <div className="mo-card-head-left">
                  <span className="mo-order-icon">{meta.icon}</span>
                  <div>
                    <div className="mo-order-num">Order #{order.id}</div>
                    <div style={{ fontSize: "13px", fontWeight: "800", color: "#1e40af", margin: "2px 0" }}>
                      🏪 {order.restaurant_name || "Kathmandu Restaurant"}
                    </div>
                    <div className="mo-order-date">🗓️ {fmtDate(order.order_date)}</div>
                  </div>
                </div>

                <div className="mo-card-head-right">
                  <span
                    className="mo-status-badge"
                    style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}
                  >
                    {meta.label}
                  </span>
                  <span className="mo-card-price">Rs. {Number(order.total_amount).toFixed(0)}</span>
                  
                  <Link
                    to={`/orders/${order.id}/track`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      background: "#2563eb",
                      color: "#fff",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      textDecoration: "none",
                      marginLeft: "6px",
                    }}
                  >
                    📍 Track
                  </Link>

                  {order.status === "Delivered" && (
                    <Link
                      to={`/orders/${order.id}/review`}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        background: "#16a34a",
                        color: "#fff",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "700",
                        textDecoration: "none",
                        marginLeft: "4px",
                      }}
                    >
                      ⭐ Review
                    </Link>
                  )}

                  <span className={`mo-chevron ${isOpen ? "open" : ""}`}>›</span>
                </div>
              </div>

              {/* ── Expandable body ── */}
              {isOpen && (
                <div className="mo-card-body">

                  {/* progress tracker (not for Cancelled) */}
                  {!cancelled && (
                    <>
                      <div className="mo-progress">
                        {STATUS_STEPS.map((step, i) => (
                          <div
                            key={step}
                            className={`mo-step ${i <= stepIdx ? "done" : ""} ${i === stepIdx ? "current" : ""}`}
                          >
                            <div className="mo-step-dot">
                              {i < stepIdx  ? "✓" : ""}
                              {i === stepIdx ? STATUS_META[step]?.icon : ""}
                            </div>
                            {i < STATUS_STEPS.length - 1 && (
                              <div className={`mo-step-line ${i < stepIdx ? "done" : ""}`} />
                            )}
                            <span className="mo-step-label">{step}</span>
                          </div>
                        ))}
                      </div>

                    </>
                  )}

                  {cancelled && (
                    <div className="mo-cancelled-banner">
                      ✕ This order was cancelled
                    </div>
                  )}

                  {/* items list */}
                  <div className="mo-items">
                    <div className="mo-items-head">
                      <span>Items</span>
                      <span>Qty</span>
                      <span>Subtotal</span>
                    </div>
                    {order.items.map(item => (
                      <div className="mo-item-row" key={item.id}>
                        <span className="mo-item-name">🍽️ {item.food_name}</span>
                        <span className="mo-item-qty">×{item.quantity}</span>
                        <span className="mo-item-sub">Rs. {(item.price * item.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>

                  {/* order meta footer */}
                  <div className="mo-meta-row">
                    <div className="mo-meta-item">
                      <span className="mo-meta-label">📍 Delivery Address</span>
                      <span className="mo-meta-val">{order.address}</span>
                    </div>
                    <div className="mo-meta-item">
                      <span className="mo-meta-label">💳 Payment</span>
                      <span className="mo-meta-val">{order.payment_method}</span>
                    </div>
                    <div className="mo-meta-item mo-meta-total">
                      <span className="mo-meta-label">Total Paid</span>
                      <span className="mo-total-amt">Rs. {Number(order.total_amount).toFixed(0)}</span>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyOrders;
