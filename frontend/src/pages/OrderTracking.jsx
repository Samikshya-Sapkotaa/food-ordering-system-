import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";

const STATUS_STEPS = [
  { key: "Pending", label: "Order Placed", icon: "📝", desc: "Waiting for restaurant to accept" },
  { key: "Confirmed", label: "Accepted", icon: "👍", desc: "Restaurant accepted your order" },
  { key: "Preparing", label: "Preparing Food", icon: "🍳", desc: "Chef is preparing your meal" },
  { key: "Ready for Pickup", label: "Ready for Pickup", icon: "📦", desc: "Food is packed and ready" },
  { key: "Out for Delivery", label: "Out for Delivery", icon: "🛵", desc: "Delivery is on the way to you" },
  { key: "Delivered", label: "Delivered", icon: "🎉", desc: "Order delivered! Enjoy your meal" },
];

function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrder();
    // Poll every 5 seconds for live status updates
    const interval = setInterval(fetchOrder, 5000);
    return () => clearInterval(interval);
  }, [id]);

  async function fetchOrder() {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      await api.put(`/orders/${id}/cancel`);
      showToast("Order cancelled successfully", "success");
      fetchOrder();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to cancel order", "error");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <Loader />;
  if (!order) return <div className="card-box" style={{ textAlign: "center", padding: "40px" }}>Order not found.</div>;

  const isCancelled = order.status === "Cancelled";
  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div style={{ maxWidth: "700px", margin: "30px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
            Track Order #{order.id}
          </h2>
          <span style={{ fontSize: "13px", color: "#64748b" }}>
            Placed on {new Date(order.order_date).toLocaleString()}
          </span>
        </div>
        <Link to="/orders" className="btn-secondary" style={{ padding: "8px 16px", textDecoration: "none" }}>
          ← Back to Orders
        </Link>
      </div>

      {/* Cancelled Banner */}
      {isCancelled ? (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", padding: "20px", borderRadius: "14px", textAlign: "center", marginBottom: "24px" }}>
          <h3 style={{ margin: "0 0 6px 0", fontSize: "18px", fontWeight: "800" }}>🚫 Order Cancelled</h3>
          <p style={{ margin: 0, fontSize: "14px" }}>This order was cancelled ({order.cancelled_by ? `by ${order.cancelled_by}` : "user cancelled"}).</p>
        </div>
      ) : (
        /* Status Tracker Progress Bar */
        <div className="card-box" style={{ marginBottom: "24px", padding: "24px" }}>
          <h4 style={{ margin: "0 0 20px 0", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
            Live Delivery Tracker (Auto-Refreshing)
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "relative" }}>
            {STATUS_STEPS.map((step, idx) => {
              const isPassed = currentIndex >= idx;
              const isCurrent = currentIndex === idx;

              return (
                <div key={step.key} style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: isCurrent ? "#2563eb" : isPassed ? "#16a34a" : "#f1f5f9",
                      color: isPassed || isCurrent ? "#ffffff" : "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      fontWeight: "bold",
                      boxShadow: isCurrent ? "0 0 0 4px rgba(37,99,235,0.25)" : "none",
                      transition: "all 0.3s",
                      flexShrink: 0,
                    }}
                  >
                    {isPassed && !isCurrent ? "✓" : step.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "15px", fontWeight: isCurrent ? "800" : isPassed ? "700" : "500", color: isCurrent ? "#2563eb" : isPassed ? "#0f172a" : "#94a3b8" }}>
                      {step.label} {isCurrent && <span style={{ fontSize: "11px", background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: "10px", marginLeft: "6px" }}>Current Status</span>}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{step.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          {order.status === "Pending" && (
            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #e2e8f0", textAlign: "right" }}>
              <button onClick={handleCancel} disabled={cancelling} className="btn-danger" style={{ background: "#dc2626", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>
                {cancelling ? "Cancelling..." : "❌ Cancel Order"}
              </button>
            </div>
          )}

          {order.status === "Delivered" && (
            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
              <button onClick={() => navigate(`/orders/${order.id}/review`)} className="btn-primary" style={{ padding: "10px 24px", fontSize: "14px", fontWeight: "800" }}>
                ⭐ Write a Review
              </button>
            </div>
          )}
        </div>
      )}

      {/* Order Summary Box */}
      <div className="card-box" style={{ padding: "20px" }}>
        <h4 style={{ margin: "0 0 14px 0", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>Order Summary</h4>
        <div style={{ fontSize: "13px", color: "#475569", marginBottom: "12px" }}>
          <div><strong>Delivery Address:</strong> {order.address}</div>
          <div><strong>Phone:</strong> {order.phone}</div>
          <div><strong>Payment Method:</strong> {order.payment_method}</div>
        </div>

        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>
          {order.items?.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "4px 0" }}>
              <span>{item.food_name} x {item.quantity}</span>
              <span style={{ fontWeight: "700" }}>Rs. {item.price * item.quantity}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "900", color: "#0f172a", marginTop: "10px", borderTop: "1px solid #cbd5e1", paddingTop: "8px" }}>
            <span>Total Paid</span>
            <span>Rs. {order.total_amount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderTracking;
