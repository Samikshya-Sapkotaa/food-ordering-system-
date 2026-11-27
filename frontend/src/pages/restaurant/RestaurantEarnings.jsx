import { useState, useEffect } from "react";
import api from "../../api";
import Loader from "../../components/Loader";
import RestaurantNavbar from "../../components/RestaurantNavbar";

function RestaurantEarnings() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await api.get("/orders/all");
      setOrders(res.data.filter((o) => o.status === "Delivered"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loader text="Calculating earnings..." />;

  const totalSales = orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0);
  const platformCommission = totalSales * 0.1; // 10% platform fee
  const netEarnings = totalSales - platformCommission;

  // Group by Date
  const salesByDate = {};
  orders.forEach((o) => {
    const dateStr = new Date(o.order_date).toLocaleDateString();
    if (!salesByDate[dateStr]) {
      salesByDate[dateStr] = { count: 0, total: 0 };
    }
    salesByDate[dateStr].count += 1;
    salesByDate[dateStr].total += parseFloat(o.total_amount);
  });

  return (
    <div>
      <RestaurantNavbar />
      <div style={{ maxWidth: "1000px", margin: "30px auto", padding: "0 20px" }}>

        <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", marginBottom: "6px" }}>
          💰 Earnings & Financial Summary
        </h2>
        <p style={{ color: "#64748b", margin: "0 0 24px 0", fontSize: "14px" }}>
          Track total sales revenue, platform commission deductions, and net payouts.
        </p>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "30px" }}>
          <div className="card-box" style={{ padding: "20px", borderLeft: "4px solid #16a34a" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Gross Sales Revenue</span>
            <div style={{ fontSize: "28px", fontWeight: "900", color: "#16a34a", marginTop: "4px" }}>Rs. {totalSales.toFixed(0)}</div>
            <span style={{ fontSize: "12px", color: "#16a34a" }}>{orders.length} completed orders</span>
          </div>

          <div className="card-box" style={{ padding: "20px", borderLeft: "4px solid #dc2626" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Platform Fee (10%)</span>
            <div style={{ fontSize: "28px", fontWeight: "900", color: "#dc2626", marginTop: "4px" }}>- Rs. {platformCommission.toFixed(0)}</div>
            <span style={{ fontSize: "12px", color: "#dc2626" }}>Platform service charge</span>
          </div>

          <div className="card-box" style={{ padding: "20px", borderLeft: "4px solid #2563eb" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Net Payout</span>
            <div style={{ fontSize: "28px", fontWeight: "900", color: "#2563eb", marginTop: "4px" }}>Rs. {netEarnings.toFixed(0)}</div>
            <span style={{ fontSize: "12px", color: "#2563eb" }}>Ready for bank payout</span>
          </div>
        </div>

        {/* Daily Sales Breakdown Table */}
        <div className="card-box" style={{ padding: "20px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
            Daily Sales Summary Table
          </h3>

          {Object.keys(salesByDate).length === 0 ? (
            <p style={{ color: "#64748b" }}>No delivered sales recorded yet.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                  <th style={{ padding: "10px" }}>Date</th>
                  <th style={{ padding: "10px" }}>Orders Delivered</th>
                  <th style={{ padding: "10px" }}>Gross Sales</th>
                  <th style={{ padding: "10px" }}>Platform Fee (10%)</th>
                  <th style={{ padding: "10px" }}>Net Earnings</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(salesByDate).map(([date, data]) => {
                  const gross = data.total;
                  const fee = gross * 0.1;
                  const net = gross - fee;

                  return (
                    <tr key={date} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "10px", fontWeight: "700" }}>{date}</td>
                      <td style={{ padding: "10px" }}>{data.count}</td>
                      <td style={{ padding: "10px", color: "#16a34a", fontWeight: "700" }}>Rs. {gross.toFixed(0)}</td>
                      <td style={{ padding: "10px", color: "#dc2626" }}>Rs. {fee.toFixed(0)}</td>
                      <td style={{ padding: "10px", color: "#2563eb", fontWeight: "800" }}>Rs. {net.toFixed(0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}

export default RestaurantEarnings;
