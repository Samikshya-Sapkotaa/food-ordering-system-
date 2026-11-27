import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getImageUrl } from "../utils/image";

const CATEGORY_ICONS = {
  starters: "🥗",
  "main course": "🍛",
  "pizza & burger": "🍕",
  beverages: "🥤",
  desserts: "🍮",
};
function getCategoryIcon(name) {
  return CATEGORY_ICONS[name?.toLowerCase()] ?? "🍽️";
}

const CATEGORY_GRADIENTS = {
  starters: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  "main course": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "pizza & burger": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  beverages: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  desserts: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
};
function getCardGradient(category) {
  return (
    CATEGORY_GRADIENTS[category?.toLowerCase()] ||
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)"
  );
}

// Bestseller items list for special badge
const BESTSELLERS = ["Paneer Tikka", "Margherita Pizza", "Paneer Butter Masala", "Cold Coffee", "Veg Biryani"];

function Menu() {
  const [categories, setCategories]             = useState([]);
  const [foods, setFoods]                       = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading]                   = useState(true);
  const [search, setSearch]                     = useState("");
  const [sortBy, setSortBy]                     = useState("default"); // default, price-asc, price-desc, bestseller
  const [addingId, setAddingId]                 = useState(null);

  // Cart state for direct quantity management from menu
  const [cartItemsMap, setCartItemsMap]         = useState({}); // food_id -> { cartId, quantity }
  const [cartTotal, setCartTotal]               = useState(0);

  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [currentRestaurant, setCurrentRestaurant] = useState(null);

  useEffect(() => {
    loadCategories();
    const searchParams = new URLSearchParams(window.location.search);
    const restId = searchParams.get("restaurant_id");
    const urlSearch = searchParams.get("search");

    if (urlSearch) {
      setSearch(urlSearch);
    }
    if (restId) {
      api.get(`/restaurants/${restId}`)
        .then((res) => setCurrentRestaurant(res.data))
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    loadFoods();
  }, [selectedCategory]);

  useEffect(() => {
    if (user && user.role === "customer") {
      loadCartState();
    }
  }, [user]);

  async function loadCategories() {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) { console.error(err); }
  }

  async function loadFoods() {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const restId = searchParams.get("restaurant_id");

      let queryParams = new URLSearchParams();
      if (selectedCategory) queryParams.set("category", selectedCategory);
      if (restId) queryParams.set("restaurant_id", restId);

      const queryString = queryParams.toString();
      let url = "/foods" + (queryString ? "?" + queryString : "");
      const res = await api.get(url);

      setFoods(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function loadCartState() {
    try {
      const res = await api.get("/cart");
      const map = {};
      let sum = 0;
      res.data.items?.forEach(item => {
        map[item.food_id] = { cartId: item.id, quantity: item.quantity };
        sum += item.price * item.quantity;
      });
      setCartItemsMap(map);
      setCartTotal(sum);
    } catch (err) { console.error(err); }
  }

  async function addToCart(foodId) {
    if (!user) { navigate("/login"); return; }
    if (user.role === "admin") { showToast("Admin cannot order food", "info"); return; }

    setAddingId(foodId);
    try {
      await api.post("/cart", { food_id: foodId });
      showToast("Item added to cart 🛒");
      await loadCartState();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not add to cart", "error");
    }
    setAddingId(null);
  }

  async function updateCartQty(cartId, action) {
    try {
      await api.put("/cart/" + cartId, { action });
      await loadCartState();
    } catch (err) { console.error(err); }
  }

  /* Filter & Sort logic */
  const filtered = useMemo(() => {
    let list = [...foods];
    const q = search.trim().toLowerCase();

    if (q) {
      list = list.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.description?.toLowerCase().includes(q) ||
        f.category_name?.toLowerCase().includes(q)
      );
    }

    if (sortBy === "price-asc") {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "bestseller") {
      list.sort((a, b) => (BESTSELLERS.includes(b.name) ? 1 : 0) - (BESTSELLERS.includes(a.name) ? 1 : 0));
    }

    return list;
  }, [foods, search, sortBy]);

  const totalCartCount = Object.values(cartItemsMap).reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="menu-page">

      {/* ── HERO BANNER ─────────────────────────────────────────── */}
      <div className="menu-hero">
        <img
          src={currentRestaurant?.image ? getImageUrl(currentRestaurant.image) : "/menu-hero.png"}
          alt={currentRestaurant?.name || "Delicious food spread"}
          className="menu-hero-img"
        />
        <div className="menu-hero-overlay">
          
          <div className="menu-hero-badge-group">
            <span className="menu-hero-tag">
              {currentRestaurant ? `🏪 ${currentRestaurant.name}` : "🇳🇵 Kathmandu's #1 Food Hub"}
            </span>
            <span className="menu-rating-chip">
              ★ {currentRestaurant?.rating || "4.9"} ({currentRestaurant?.rating_count || "1,200+ Reviews"})
            </span>
          </div>

          <h1 className="menu-hero-title">
            {currentRestaurant ? currentRestaurant.name : "Delicious Food Delivered Hot"}
          </h1>
          <p className="menu-hero-sub">
            {currentRestaurant
              ? `📍 ${currentRestaurant.address} • 🍲 ${currentRestaurant.cuisines || currentRestaurant.cuisine || "Nepalese & Multi-Cuisine"}`
              : "Freshly prepared dishes delivered across Kathmandu valley in under 30 minutes"}
          </p>

          {/* Search bar inside hero */}
          <div className="menu-search-wrap">
            <span className="menu-search-icon">🔍</span>
            <input
              id="menu-search"
              className="menu-search"
              type="text"
              placeholder={`Search dishes inside ${currentRestaurant?.name || "menu"}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="menu-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Stats Bar */}
          <div className="menu-hero-stats">
            <div className="hero-stat">
              <span className="stat-val">{currentRestaurant?.delivery_time || "25 Min"}</span>
              <span className="stat-lbl">Avg Delivery</span>
            </div>
            <div className="stat-line" />
            <div className="hero-stat">
              <span className="stat-val">{currentRestaurant?.price_for_two ? `Rs. ${currentRestaurant.price_for_two}` : "100%"}</span>
              <span className="stat-lbl">{currentRestaurant ? "Price for Two" : "Fresh Ingredients"}</span>
            </div>
            <div className="stat-line" />
            <div className="hero-stat">
              <span className="stat-val">{currentRestaurant?.offer_text || "Rs. 0"}</span>
              <span className="stat-lbl">{currentRestaurant ? "Special Offer" : "Free Delivery > Rs.500"}</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── KATHMANDU DEALS STRIP ───────────────────────────────── */}
      <div className="menu-features-strip">
        <div className="feature-item">
          <span className="feature-icon">🇳🇵</span>
          <div>
            <strong>Kathmandu Express</strong>
            <span>Fast 25-min delivery across Thamel, Baneshwor & Durbar Marg</span>
          </div>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🎁</span>
          <div>
            <strong>Special Coupon</strong>
            <span>Use code <strong>KATHMANDU15</strong> for 15% OFF above Rs. 500</span>
          </div>
        </div>
        <div className="feature-item">
          <span className="feature-icon">📱</span>
          <div>
            <strong>Instant Digital Pay</strong>
            <span>Pay securely via eSewa, Khalti or ConnectIPS</span>
          </div>
        </div>
      </div>

      {/* ── MAIN BODY & FILTER BAR ──────────────────────────────── */}
      <div className="menu-body">

        {/* Category Pills Bar */}
        <div className="cat-pill-row" role="group" aria-label="Filter by category">
          <button
            className={`cat-pill ${selectedCategory === "" ? "active" : ""}`}
            onClick={() => setSelectedCategory("")}
          >
            <span className="cat-pill-icon">🍽️</span>
            All Dishes
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`cat-pill ${selectedCategory === cat.id ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="cat-pill-icon">{getCategoryIcon(cat.name)}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Secondary Filters Bar (Sorting & Veg Switch) */}
        <div className="menu-controls-bar">
          <div className="menu-results-count">
            {!loading && (
              <span>Showing <strong>{filtered.length}</strong> delicious dish{filtered.length === 1 ? "" : "es"}</span>
            )}
          </div>

          <div className="menu-filters-right">
            {/* Sort Dropdown */}
            <div className="sort-dropdown-wrap">
              <span className="sort-icon">⇅</span>
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort dishes"
              >
                <option value="default">Sort by: Default</option>
                <option value="bestseller">🔥 Popular / Bestsellers</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── FOOD GRID ────────────────────────────────────────── */}
        {loading ? (
          <Loader text="Loading fresh menu…" />
        ) : filtered.length === 0 ? (
          <div className="menu-empty">
            <span className="menu-empty-icon">🔍</span>
            <h3>No dishes found</h3>
            <p>Try resetting filters or search for something else.</p>
            <button className="reset-filters-btn" onClick={() => { setSearch(""); setSortBy("default"); setSelectedCategory(""); }}>
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="food-grid-pro">
            {filtered.map((food, index) => {
              const isBestseller = BESTSELLERS.includes(food.name);
              const cartEntry    = cartItemsMap[food.id];
              const inCartQty    = cartEntry?.quantity || 0;

              return (
                <div
                  className="food-card-pro"
                  key={food.id}
                  style={{ "--i": index }}
                >
                  {/* Top banner: real photo or gradient with emoji */}
                  <div
                    className="food-card-banner"
                    style={food.image ? {} : { background: getCardGradient(food.category_name) }}
                  >
                    {food.image ? (
                      <img
                        src={getImageUrl(food.image)}
                        alt={food.name}
                        className="food-card-img"
                      />
                    ) : (
                      <span className="food-card-emoji">
                        {getCategoryIcon(food.category_name)}
                      </span>
                    )}

                    {/* Badges on banner */}
                    <div className="food-card-badges">
                      {isBestseller && (
                        <span className="bestseller-badge">🔥 Bestseller</span>
                      )}
                      <span className="rating-badge">★ 4.8</span>
                    </div>
                  </div>

                  <div className="food-card-body">
                    {/* category badge & prep time */}
                    <div className="food-card-meta">
                      <span className="food-badge">{food.category_name}</span>
                      <span className="prep-time">⏱️ 15-20 min</span>
                    </div>

                    <h3 className="food-name" style={{ marginBottom: "2px" }}>{food.name}</h3>

                    {food.restaurant_name && (
                      <div style={{ fontSize: "11px", fontWeight: "800", color: "#1e40af", background: "#eff6ff", padding: "2px 8px", borderRadius: "6px", border: "1px solid #bfdbfe", marginBottom: "8px", display: "inline-block" }}>
                        🏪 {food.restaurant_name}
                      </div>
                    )}

                    <p className="food-desc">
                      {food.description || "A delicious, authentic dish prepared fresh for you."}
                    </p>

                    <div className="food-card-footer">
                      <span className="food-price">
                        <span className="food-price-cur">Rs. </span>
                        {Number(food.price).toFixed(0)}
                      </span>

                      {/* Interactive Add to Cart or Quantity Controls */}
                      {inCartQty > 0 ? (
                        <div className="card-qty-control">
                          <button
                            className="card-qty-btn"
                            onClick={() => updateCartQty(cartEntry.cartId, "decrease")}
                            title="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="card-qty-val">{inCartQty} in Cart</span>
                          <button
                            className="card-qty-btn"
                            onClick={() => updateCartQty(cartEntry.cartId, "increase")}
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          className={`add-btn ${addingId === food.id ? "add-btn-loading" : ""}`}
                          onClick={() => addToCart(food.id)}
                          disabled={addingId === food.id}
                          id={`add-to-cart-${food.id}`}
                        >
                          {addingId === food.id ? (
                            <span className="add-btn-spinner" />
                          ) : (
                            <>
                              <span className="add-btn-icon">+</span>
                              Add to Cart
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── FLOATING QUICK CART BAR (Shows when customer has items) ── */}
      {user && user.role === "customer" && totalCartCount > 0 && (
        <div className="floating-cart-bar">
          <div className="floating-cart-info">
            <span className="floating-cart-count">🛒 {totalCartCount} item{totalCartCount === 1 ? "" : "s"} added</span>
            <span className="floating-cart-total">Rs. {cartTotal.toFixed(0)}</span>
          </div>
          <button className="floating-cart-btn" onClick={() => navigate("/cart")}>
            View Cart & Checkout →
          </button>
        </div>
      )}

    </div>
  );
}

export default Menu;
