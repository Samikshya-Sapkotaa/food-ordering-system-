import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import Loader from "../../components/Loader";
import RestaurantNavbar from "../../components/RestaurantNavbar";

function RestaurantDashboard() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [ordersRes, foodsRes, profileRes] = await Promise.all([
        api.get("/orders/all"),
        api.get("/foods/all"),
        api.get("/restaurants/my").catch(() => ({ data: null })),
      ]);
      setOrders(ordersRes.data);
      setMenuItems(foodsRes.data);
      setProfile(profileRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loader text="Loading restaurant dashboard..." />;

  const pendingOrders = orders.filter((o) => o.status === "Pending");
  const activeOrders = orders.filter((o) => ["Confirmed", "Preparing", "Ready for Pickup", "Out for Delivery"].includes(o.status));
  const deliveredOrders = orders.filter((o) => o.status === "Delivered");
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);

  return (
    <div>
      <RestaurantNavbar />
      <div style={{ maxWidth: "1100px", margin: "30px auto", padding: "0 20px" }}>

        {/* Welcome Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
              🍳 {profile?.name || "Restaurant"} Dashboard
            </h2>
            <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>
              Welcome back! Here is your real-time restaurant performance overview.
            </p>
          </div>
          <Link to="/restaurant/orders" className="btn-primary" style={{ padding: "10px 20px", textDecoration: "none", fontSize: "14px", fontWeight: "800" }}>
            🛎️ Manage Orders ({pendingOrders.length} Pending)
          </Link>
        </div>

        {/* Stats Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "30px" }}>
          <div className="card-box" style={{ padding: "20px", borderLeft: "4px solid #3b82f6" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Total Orders Today</span>
            <div style={{ fontSize: "28px", fontWeight: "900", color: "#0f172a", marginTop: "4px" }}>{orders.length}</div>
            <span style={{ fontSize: "12px", color: "#3b82f6" }}>All time orders received</span>
          </div>

          <div className="card-box" style={{ padding: "20px", borderLeft: "4px solid #eab308" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Pending Acceptance</span>
            <div style={{ fontSize: "28px", fontWeight: "900", color: "#d97706", marginTop: "4px" }}>{pendingOrders.length}</div>
            <span style={{ fontSize: "12px", color: "#d97706" }}>Needs immediate action</span>
          </div>

          <div className="card-box" style={{ padding: "20px", borderLeft: "4px solid #8b5cf6" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>In-Progress Orders</span>
            <div style={{ fontSize: "28px", fontWeight: "900", color: "#7c3aed", marginTop: "4px" }}>{activeOrders.length}</div>
            <span style={{ fontSize: "12px", color: "#7c3aed" }}>Preparing or out for delivery</span>
          </div>

          <div className="card-box" style={{ padding: "20px", borderLeft: "4px solid #16a34a" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Total Revenue</span>
            <div style={{ fontSize: "28px", fontWeight: "900", color: "#16a34a", marginTop: "4px" }}>Rs. {totalRevenue.toFixed(0)}</div>
            <span style={{ fontSize: "12px", color: "#16a34a" }}>From {deliveredOrders.length} delivered orders</span>
          </div>
        </div>

        {/* Quick Links & Recent Incoming Orders */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
          {/* Recent Orders List */}
          <div className="card-box" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>Recent Incoming Orders</h3>
              <Link to="/restaurant/orders" style={{ fontSize: "13px", fontWeight: "700", color: "#2563eb", textDecoration: "none" }}>View All →</Link>
            </div>

            {orders.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "14px" }}>No orders received yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {orders.slice(0, 5).map((o) => (
                  <div key={o.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <div>
                      <strong style={{ fontSize: "14px", color: "#0f172a" }}>Order #{o.id}</strong> — {o.customer_name || "Customer"}
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                        {o.items?.length || 0} items • Rs. {o.total_amount} • {o.payment_method}
                      </div>
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: "800", padding: "4px 10px", borderRadius: "12px", background: o.status === "Delivered" ? "#dcfce7" : o.status === "Pending" ? "#fef9c3" : "#dbeafe", color: o.status === "Delivered" ? "#15803d" : o.status === "Pending" ? "#a16207" : "#1e40af" }}>
                      {o.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Menu Summary */}
          <div className="card-box" style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>Quick Menu Overview</h3>
            <div style={{ fontSize: "14px", color: "#475569", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Total Dishes</span>
                <strong>{menuItems.length} items</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Available Dishes</span>
                <strong style={{ color: "#16a34a" }}>{menuItems.filter((i) => i.is_available).length} active</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Unavailable Dishes</span>
                <strong style={{ color: "#dc2626" }}>{menuItems.filter((i) => !i.is_available).length} hidden</strong>
              </div>

              <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #e2e8f0" }}>
                <Link to="/restaurant/menu" className="btn-secondary" style={{ width: "100%", display: "block", textAlign: "center", textDecoration: "none", padding: "10px", fontSize: "13px", fontWeight: "700" }}>
                  📖 Manage Menu Dishes
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default RestaurantDashboard;
