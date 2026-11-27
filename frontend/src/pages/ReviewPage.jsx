import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";

function ReviewPage() {
  const { id } = useParams(); // orderId
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const [orderRes, checkRes] = await Promise.all([
        api.get(`/orders/${id}`),
        api.get(`/reviews/check/${id}`),
      ]);
      setOrder(orderRes.data);
      setAlreadyReviewed(checkRes.data.reviewed);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/reviews", {
        order_id: Number(id),
        restaurant_id: order?.restaurant_id || 1,
        rating,
        comment,
      });
      showToast("Thank you for your review!", "success");
      navigate("/orders");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to submit review", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loader />;
  if (!order) return <div className="card-box" style={{ padding: "40px", textAlign: "center" }}>Order not found.</div>;

  if (alreadyReviewed) {
    return (
      <div style={{ maxWidth: "500px", margin: "40px auto", textAlign: "center" }} className="card-box">
        <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#16a34a", marginBottom: "10px" }}>✓ Review Submitted</h2>
        <p style={{ color: "#64748b", marginBottom: "20px" }}>You have already submitted a review for Order #{id}.</p>
        <Link to="/orders" className="btn-primary" style={{ padding: "10px 20px", textDecoration: "none" }}>Back to Orders</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "550px", margin: "40px auto" }}>
      <div className="card-box" style={{ padding: "30px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", marginBottom: "6px" }}>
          Rate & Review Order #{order.id}
        </h2>
        <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px" }}>
          How was your meal from <strong>{order.restaurant_name || "Foodie Corner"}</strong>?
        </p>

        <form onSubmit={handleSubmit}>
          {/* Star Rating */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#334155", marginBottom: "10px" }}>
              Your Rating (1 to 5 Stars)
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    background: star <= rating ? "#fef08a" : "#f1f5f9",
                    border: star <= rating ? "2px solid #eab308" : "1px solid #cbd5e1",
                    borderRadius: "10px",
                    width: "50px",
                    height: "50px",
                    fontSize: "24px",
                    cursor: "pointer",
                    transition: "transform 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  ⭐
                </button>
              ))}
            </div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#d97706", marginTop: "8px" }}>
              {rating === 5 ? "5/5 — Excellent!" : rating === 4 ? "4/5 — Very Good" : rating === 3 ? "3/5 — Average" : rating === 2 ? "2/2 — Below Expectations" : "1/5 — Poor"}
            </div>
          </div>

          {/* Comment */}
          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#334155", marginBottom: "8px" }}>
              Comments / Detailed Review
            </label>
            <textarea
              className="auth-input"
              rows={4}
              placeholder="Tell us about the food quality, packaging, delivery speed..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, padding: "12px", fontSize: "15px", fontWeight: "800" }}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <Link to="/orders" className="btn-secondary" style={{ padding: "12px 20px", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewPage;
