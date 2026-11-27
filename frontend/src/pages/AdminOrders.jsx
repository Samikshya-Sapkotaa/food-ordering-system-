import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";

const STATUS_LIST = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready for Pickup",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const STATUS_META = {
  Pending:           { icon: "🕐", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  Confirmed:         { icon: "✅", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
  Preparing:         { icon: "🍳", color: "#d97706", bg: "#fef3c7", border: "#fde68a" },
  "Ready for Pickup":{ icon: "📦", color: "#0284c7", bg: "#e0f2fe", border: "#bae6fd" },
  "Out for Delivery":{ icon: "🛵", color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe" },
  Delivered:         { icon: "🎉", color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
  Cancelled:         { icon: "✕",  color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
};

function getMeta(status) {
  return STATUS_META[status] ?? STATUS_META["Pending"];
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders]     = useState([]);
  const [Deliverys, setDeliverys]     = useState([]);
  const [filter, setFilter]     = useState("All");
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState({});
  const [updating, setUpdating] = useState(null);

  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [ordersRes, usersRes] = await Promise.all([
        api.get("/orders/all"),
        api.get("/auth/users").catch(() => ({ data: [] })),
      ]);

      setOrders(ordersRes.data || []);
      const DeliveryUsers = usersRes.data?.filter(u => u.role === "Delivery") || [];
      setDeliverys(DeliveryUsers);
    } catch (err) {
    }
    setLoading(false);
  }

  async function updateStatus(orderId, newStatus) {
    setUpdating(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      showToast(`Status updated to ${newStatus} ✓`);
      await loadData();
    } catch (err) {
      showToast("Could not update status", "error");
    }
    setUpdating(null);
  }

  async function assignDelivery(orderId, DeliveryId) {
    setUpdating(orderId);
    try {
      await api.put(`/orders/${orderId}/assign-Delivery`, { Delivery_id: DeliveryId });
      showToast("Delivery assigned to order ✓");
      await loadData();
    } catch (err) {
      showToast("Could not assign Delivery", "error");
    }
    setUpdating(null);
  }

  function toggle(id) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const shown  = filter === "All" ? orders : orders.filter(o => o.status === filter);
  const counts = {};
  orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });

  if (loading) return <Loader text="Loading customer & kitchen orders…" />;

  return (
    <div className="ao-page">

      {/* ── PAGE HEADER ─────────────────────────────────────── */}
      <div className="ao-header">
        <div className="ao-header-left">
          <span className="ao-header-icon">🗃️</span>
          <div>
            <h2 className="ao-title">Order Logistics & Actor Details</h2>
            <p className="ao-subtitle">View Customer, Restaurant / Kitchen, and Assigned Delivery info for every order</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/admin")}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "#f8fafc", border: "1.5px solid #e2e8f0",
            borderRadius: "10px", padding: "9px 18px",
            fontSize: "13px", fontWeight: "700", color: "#334155",
            cursor: "pointer", transition: "all 0.18s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.color = "#1d4ed8"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#334155"; }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* ── STAT STRIP ─────────────────────────────────────── */}
      <div className="ao-stat-strip">
        <div className="ao-stat">
          <span className="ao-stat-num">{orders.length}</span>
          <span className="ao-stat-label">Total Orders</span>
        </div>
        <div className="ao-stat-div" />
        <div className="ao-stat">
          <span className="ao-stat-num ao-amber">{counts["Pending"] || 0}</span>
          <span className="ao-stat-label">Pending</span>
        </div>
        <div className="ao-stat-div" />
        <div className="ao-stat">
          <span className="ao-stat-num ao-purple">{counts["Out for Delivery"] || 0}</span>
          <span className="ao-stat-label">Out for Delivery</span>
        </div>
        <div className="ao-stat-div" />
        <div className="ao-stat">
          <span className="ao-stat-num ao-green">{counts["Delivered"] || 0}</span>
          <span className="ao-stat-label">Delivered</span>
        </div>
      </div>

      {/* ── FILTER PILLS ────────────────────────────────────── */}
      <div className="ao-filter-row">
        {["All", ...STATUS_LIST].map(s => (
          <button
            key={s}
            className={`ao-filter-pill ${filter === s ? "active" : ""}`}
            onClick={() => setFilter(s)}
          >
            <span>{STATUS_META[s]?.icon || "📋"}</span>
            {s}
            <span className="ao-pill-count">{s === "All" ? orders.length : (counts[s] || 0)}</span>
          </button>
        ))}
      </div>

      <p className="ao-count">
        Showing <strong>{shown.length}</strong> order{shown.length === 1 ? "" : "s"}
      </p>

      {/* ── ORDER CARDS ─────────────────────────────────────── */}
      {shown.length === 0 ? (
        <div className="ao-empty">
          <span className="ao-empty-icon">📭</span>
          <p>No orders in this category yet.</p>
        </div>
      ) : (
        <div className="ao-list">
          {shown.map((order, index) => {
            const meta   = getMeta(order.status);
            const isOpen = !!expanded[order.id];

            return (
              <div
                className="ao-card"
                key={order.id}
                style={{ "--i": index, "--status-color": meta.color }}
              >
                {/* ── Accordion Header ── */}
                <div
                  className="ao-card-head"
                  onClick={() => toggle(order.id)}
                  role="button"
                  aria-expanded={isOpen}
                >
                  <div className="ao-card-head-left">
                    <span className="ao-order-icon">{meta.icon}</span>
                    <div>
                      <div className="ao-order-num">Order #{order.id}</div>
                      <div className="ao-order-customer">
                        👤 Customer: <strong>{order.customer_name}</strong>
                        <span className="ao-order-email"> ({order.customer_email})</span>
                      </div>
                      <div className="ao-order-date">🗓️ {fmtDate(order.order_date)}</div>
                    </div>
                  </div>

                  <div className="ao-card-head-right">
                    <span
                      className="ao-status-badge"
                      style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}
                    >
                      {order.status}
                    </span>
                    <span className="ao-card-price">Rs. {Number(order.total_amount).toFixed(0)}</span>
                    <span className={`ao-chevron ${isOpen ? "open" : ""}`}>›</span>
                  </div>
                </div>

                {/* ── Expandable Body with 3-Actor Breakdown ── */}
                {isOpen && (
                  <div className="ao-card-body">

                    {/* 3-ACTOR TILES GRID (CUSTOMER, RESTAURANT/KITCHEN, Delivery) */}
                    <div className="ao-actor-tiles-grid">

                      {/* 1. CUSTOMER TILE */}
                      <div className="ao-actor-card customer">
                        <div className="ao-actor-head">
                          <span className="ao-actor-icon">👤</span>
                          <h4>Customer Details</h4>
                        </div>
                        <div className="ao-actor-info">
                          <span>Name: <strong>{order.customer_name}</strong></span>
                          <span>Email: <strong>{order.customer_email}</strong></span>
                          <span>Phone: <strong>+977 {order.phone}</strong></span>
                          <span>Delivery Address: <strong>{order.address}</strong></span>
                          <span>Payment: <strong>{order.payment_method}</strong></span>
                        </div>
                      </div>

                      {/* 2. RESTAURANT / KITCHEN TILE */}
                      <div className="ao-actor-card hotel">
                        <div className="ao-actor-head">
                          <span className="ao-actor-icon">🏨</span>
                          <h4>Restaurant / Kitchen</h4>
                        </div>
                        <div className="ao-actor-info">
                          <span>Hotel Name: <strong>{order.restaurant_name || "Hotel Annapurna & Kitchen"}</strong></span>
                          <span>Cuisines: <strong>{order.restaurant_cuisines || "Nepali, Newari, Indian"}</strong></span>
                          <span>Location: <strong>{order.restaurant_address || "Durbar Marg, Kathmandu"}</strong></span>
                        </div>
                      </div>

                      {/* 3. ASSIGNED Delivery TILE */}
                      <div className="ao-actor-card Delivery">
                        <div className="ao-actor-head">
                          <span className="ao-actor-icon">🛵</span>
                          <h4>Delivery Delivery</h4>
                        </div>
                        <div className="ao-actor-info">
                          <span>Delivery Name: <strong>{order.Delivery_name || "Ram Shrestha Delivery"}</strong></span>
                          <span>Contact Phone: <strong>+977 {order.Delivery_phone || "9841234567"}</strong></span>
                          <span>Status: <strong className="green">● Active Delivery</strong></span>

                          {/* Reassign Delivery Dropdown */}
                          {Deliverys.length > 0 && (
                            <div className="ao-reassign-box">
                              <label htmlFor={`assign-Delivery-${order.id}`}>Reassign Delivery:</label>
                              <select
                                id={`assign-Delivery-${order.id}`}
                                className="ao-Delivery-select"
                                value={order.Delivery_id || ""}
                                onChange={(e) => assignDelivery(order.id, e.target.value)}
                              >
                                {Deliverys.map(r => (
                                  <option key={r.id} value={r.id}>🛵 {r.name} (+977 {r.phone})</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Order Items Table */}
                    <div className="ao-items">
                      <div className="ao-items-head">
                        <span>Dish Item</span>
                        <span>Unit Price</span>
                        <span>Qty</span>
                        <span>Subtotal</span>
                      </div>
                      {order.items.map(item => (
                        <div className="ao-item-row" key={item.id}>
                          <span className="ao-item-name">🍽️ {item.food_name}</span>
                          <span className="ao-item-price">Rs. {Number(item.price).toFixed(0)}</span>
                          <span className="ao-item-qty">×{item.quantity}</span>
                          <span className="ao-item-sub">Rs. {(item.price * item.quantity).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer: Order total + status updater */}
                    <div className="ao-order-footer">
                      <div className="ao-order-total">
                        <span className="ao-total-label">Order Total</span>
                        <span className="ao-total-amt">Rs. {Number(order.total_amount).toFixed(0)}</span>
                      </div>

                      <div className="ao-status-updater">
                        <label className="ao-status-label" htmlFor={`status-${order.id}`}>
                          Update Lifecycle Status
                        </label>
                        <div className="ao-status-select-wrap">
                          <select
                            id={`status-${order.id}`}
                            className="ao-status-select"
                            value={order.status}
                            onChange={e => updateStatus(order.id, e.target.value)}
                            disabled={updating === order.id}
                          >
                            {STATUS_LIST.map(s => (
                              <option key={s} value={s}>{STATUS_META[s]?.icon} {s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
