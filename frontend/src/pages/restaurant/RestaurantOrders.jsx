import { useState, useEffect } from "react";
import api from "../../api";
import Loader from "../../components/Loader";
import RestaurantNavbar from "../../components/RestaurantNavbar";
import { useToast } from "../../context/ToastContext";

const STATUS_FLOW = ["Pending", "Confirmed", "Preparing", "Ready for Pickup", "Delivered"];

function RestaurantOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchOrders() {
    try {
      const res = await api.get("/orders/all");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId, newStatus) {
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      showToast(`Order #${orderId} status updated to ${newStatus}`, "success");
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update order status", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  async function cancelOrder(orderId) {
    if (!window.confirm("Reject this order?")) return;
    setUpdatingId(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status: "Cancelled" });
      showToast(`Order #${orderId} rejected`, "info");
      fetchOrders();
    } catch (err) {
      showToast("Failed to reject order", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <Loader text="Loading orders..." />;

  return (
    <div>
      <RestaurantNavbar />
      <div style={{ maxWidth: "1100px", margin: "30px auto", padding: "0 20px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
              🛎️ Order Management Panel
            </h2>
            <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>
              Accept, prepare, and update status of incoming customer orders in real-time.
            </p>
          </div>
          <button onClick={fetchOrders} className="btn-secondary" style={{ padding: "8px 16px", cursor: "pointer" }}>
            🔄 Refresh Orders
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="card-box" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            No orders found.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {orders.map((o) => (
              <div key={o.id} className="card-box" style={{ padding: "20px", borderLeft: `4px solid ${o.status === "Pending" ? "#eab308" : o.status === "Delivered" ? "#16a34a" : o.status === "Cancelled" ? "#dc2626" : "#2563eb"}` }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <span style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a" }}>
                      Order #{o.id}
                    </span>
                    <span style={{ marginLeft: "10px", fontSize: "13px", color: "#64748b" }}>
                      🗓️ {new Date(o.order_date).toLocaleString()}
                    </span>
                    <div style={{ fontSize: "13px", color: "#475569", marginTop: "4px" }}>
                      👤 <strong>Customer:</strong> {o.customer_name || "Customer"} ({o.phone}) • 📍 {o.address}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "18px", fontWeight: "900", color: "#16a34a" }}>
                      Rs. {o.total_amount}
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", padding: "3px 8px", borderRadius: "10px", background: o.status === "Delivered" ? "#dcfce7" : o.status === "Pending" ? "#fef9c3" : o.status === "Cancelled" ? "#fef2f2" : "#dbeafe", color: o.status === "Delivered" ? "#15803d" : o.status === "Pending" ? "#a16207" : o.status === "Cancelled" ? "#991b1b" : "#1e40af" }}>
                      {o.status}
                    </span>
                  </div>
                </div>

                {/* Items Table */}
                <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "10px", marginBottom: "16px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>
                    Ordered Dishes:
                  </div>
                  {o.items?.map((item) => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#334155", padding: "3px 0" }}>
                      <span>🍲 {item.food_name} x {item.quantity}</span>
                      <strong>Rs. {item.price * item.quantity}</strong>
                    </div>
                  ))}
                </div>

                {/* Action Flow Buttons */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "flex-end" }}>
                  {o.status === "Pending" && (
                    <>
                      <button onClick={() => cancelOrder(o.id)} disabled={updatingId === o.id} className="btn-danger" style={{ background: "#dc2626", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
                        ✕ Reject
                      </button>
                      <button onClick={() => updateStatus(o.id, "Confirmed")} disabled={updatingId === o.id} className="btn-primary" style={{ background: "#16a34a", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
                        ✓ Accept Order
                      </button>
                    </>
                  )}

                  {o.status === "Confirmed" && (
                    <button onClick={() => updateStatus(o.id, "Preparing")} disabled={updatingId === o.id} className="btn-primary" style={{ background: "#2563eb", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
                      🍳 Start Preparing
                    </button>
                  )}

                  {o.status === "Preparing" && (
                    <button onClick={() => updateStatus(o.id, "Ready for Pickup")} disabled={updatingId === o.id} className="btn-primary" style={{ background: "#8b5cf6", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
                      📦 Mark Ready for Pickup
                    </button>
                  )}

                  {o.status === "Ready for Pickup" && (
                    <>
                      <button onClick={() => updateStatus(o.id, "Out for Delivery")} disabled={updatingId === o.id} className="btn-primary" style={{ background: "#0284c7", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
                        🛵 Out for Delivery
                      </button>
                      <button onClick={() => updateStatus(o.id, "Delivered")} disabled={updatingId === o.id} className="btn-primary" style={{ background: "#16a34a", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
                        🎉 Mark as Delivered
                      </button>
                    </>
                  )}

                  {o.status === "Out for Delivery" && (
                    <button onClick={() => updateStatus(o.id, "Delivered")} disabled={updatingId === o.id} className="btn-primary" style={{ background: "#16a34a", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
                      🎉 Mark as Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RestaurantOrders;
