import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Loader from "../components/Loader";
import { getImageUrl } from "../utils/image";

function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [selectedCuisine, sortBy]);

  async function fetchInitialData() {
    try {
      const [catRes, revRes] = await Promise.all([
        api.get("/categories"),
        api.get("/reviews/recent").catch(() => ({ data: [] })),
      ]);
      setCategories(catRes.data);
      setReviews(revRes.data);
    } catch (err) {
    }
  }

  async function fetchRestaurants() {
    setLoading(true);
    try {
      const res = await api.get("/restaurants", {
        params: {
          search,
          cuisine: selectedCuisine,
          sortBy,
        },
      });
      setRestaurants(res.data);
    } catch (err) {
    }
    setLoading(false);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (search.trim()) {
      navigate("/menu?search=" + encodeURIComponent(search.trim()));
    } else {
      fetchRestaurants();
    }
  }

  return (
    <div className="sw-page">

      {/* ── SWIGGY HERO SECTION ─────────────────────────────── */}
      <div className="sw-hero">
        <div className="sw-hero-container">

          {/* Location Badge */}
          <div className="sw-location-picker">
            <span className="sw-loc-icon">📍</span>
            <div className="sw-loc-text">
              <span className="sw-loc-title">Thamel, Kathmandu</span>
              <span className="sw-loc-sub">Bagmati Province, Nepal ▾</span>
            </div>
          </div>

          <h1 className="sw-hero-headline">
            Order Food & Hotel Delicacies in Kathmandu
          </h1>
          <p className="sw-hero-sub">
            Discover top hotels & restaurants across Durbar Marg, Thamel, Baneshwor & Patan
          </p>

          {/* Search bar inside hero */}
          <form onSubmit={handleSearchSubmit} className="sw-hero-search-wrap">
            <span className="sw-search-icon">🔍</span>
            <input
              type="text"
              className="sw-hero-search-input"
              placeholder="Search for Momo, Biryani, Pizza, Coffee & Bakery..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchRestaurants();
              }}
            />
            <button type="submit" className="sw-hero-search-btn">
              Search
            </button>
          </form>

        </div>
      </div>

      {/* ── "WHAT'S ON YOUR MIND?" CATEGORIES ─────────────────── */}
      <div className="sw-mind-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 className="sw-sec-title" style={{ margin: 0 }}>What's on your mind?</h3>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "700" }}>Live Category Filters</span>
        </div>

        <div className="sw-mind-row" style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "10px" }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="sw-mind-card"
              style={{ background: cat.bg_color || "#fff7ed", padding: "12px 18px", borderRadius: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", border: "1px solid #fed7aa", flexShrink: 0 }}
              onClick={() => {
                navigate("/menu?search=" + encodeURIComponent(cat.name));
              }}
            >
              <span className="sw-mind-icon" style={{ fontSize: "22px" }}>{cat.icon || "🍽️"}</span>
              <span style={{ fontSize: "14px", fontWeight: "800", color: "green" }}>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RESTAURANTS GRID ─────────────────────────────────── */}
      <div className="sw-restaurants-section" style={{ maxWidth: "1150px", margin: "20px auto", padding: "0 20px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
              Top Hotels & Restaurants in Kathmandu
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0 0 0" }}>
              Freshly prepared & delivered hot to your doorstep
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: "6px 12px", borderRadius: "20px", border: "1px solid #cbd5e1", fontSize: "12px", fontWeight: "700", background: "#ffffff" }}
            >
              <option value="rating">Sort by: Highest Rating ★</option>
              <option value="delivery_time">Sort by: Fastest Delivery ⏱️</option>
              <option value="price_low">Sort by: Price (Low to High)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Loader text="Finding top Kathmandu restaurants…" />
        ) : restaurants.length === 0 ? (
          <div className="card-box" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            No restaurants match your search query.
          </div>
        ) : (
          <div className="sw-hotels-grid">
            {restaurants.map((rest, index) => (
              <div
                key={rest.id}
                className="sw-hotel-card"
                style={{ "--i": index }}
                onClick={() => navigate(`/menu?restaurant_id=${rest.id}`)}
              >
                {/* Hotel Banner / Image */}
                <div className="sw-hotel-banner">
                  <div className="sw-banner-gradient" />
                  {rest.image ? (
                    <img
                      src={getImageUrl(rest.image)}
                      alt={rest.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div className="sw-hotel-img-placeholder">
                      <span>🏨</span>
                    </div>
                  )}

                  {/* Offer Tag Badge */}
                  {rest.offer_text && (
                    <div className="sw-offer-badge">
                      🏷️ {rest.offer_text}
                    </div>
                  )}

                </div>

                {/* Hotel Content Details */}
                <div className="sw-hotel-body">
                  <div className="sw-hotel-title-row">
                    <h3 className="sw-hotel-name">{rest.name}</h3>
                  </div>

                  <div className="sw-hotel-meta-row">
                    <span className="sw-rating-chip">
                      ★ {Number(rest.rating || 4.8).toFixed(1)} ({rest.rating_count || "500+ ratings"})
                    </span>
                    <span className="sw-dot">•</span>
                    <span className="sw-meta-text">⏱️ {rest.delivery_time || "20-25 min"}</span>
                    <span className="sw-dot">•</span>
                    <span className="sw-meta-text">Rs. {rest.price_for_two || 400} for two</span>
                  </div>

                  <p className="sw-hotel-cuisines">{rest.cuisines || rest.cuisine}</p>
                  <p className="sw-hotel-addr">📍 {rest.address}</p>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── CUSTOMER REVIEWS & FEEDBACK SECTION ───────────────── */}
      {reviews.length > 0 && (
        <div style={{ maxWidth: "1150px", margin: "40px auto 20px auto", padding: "0 20px" }}>
          <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                  💬 Real Customer Reviews & Ratings
                </h3>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
                  Feedback from verified food lovers across Kathmandu
                </p>
              </div>
              <span style={{ fontSize: "13px", fontWeight: "800", color: "#16a34a", background: "#dcfce7", padding: "4px 12px", borderRadius: "12px" }}>
                Verified Purchases ✓
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {reviews.map((rev) => (
                <div key={rev.id} style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div>
                      <strong style={{ fontSize: "14px", color: "#0f172a" }}>👤 {rev.customer_name}</strong>
                      <div style={{ fontSize: "12px", color: "#2563eb", fontWeight: "700" }}>
                        🏪 {rev.restaurant_name || "Kathmandu Restaurant"}
                      </div>
                    </div>
                    <span style={{ background: "#fef9c3", color: "#a16207", padding: "2px 8px", borderRadius: "8px", fontSize: "12px", fontWeight: "900", border: "1px solid #fde047" }}>
                      ★ {rev.rating}/5
                    </span>
                  </div>

                  <p style={{ fontSize: "13px", color: "#334155", margin: 0, fontStyle: "italic", lineHeight: "1.4" }}>
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Home;
