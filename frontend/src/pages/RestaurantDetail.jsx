import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

const IMG_BASE = "http://localhost:5000/uploads/";

function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user }     = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [cartItems, setCartItems]   = useState({});
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [addingId, setAddingId]     = useState(null);

  useEffect(() => {
    loadRestaurantData();
    if (user && user.role === "customer") {
      fetchCart();
    }
  }, [id, user]);

  async function loadRestaurantData() {
    try {
      const res = await api.get(`/restaurants/${id}`);
      setRestaurant(res.data);
    } catch (err) {
      showToast("Could not load hotel menu", "error");
    }
    setLoading(false);
  }

  async function fetchCart() {
    try {
      const res = await api.get("/cart");
      const map = {};
      res.data.items?.forEach((item) => {
        map[item.food_id] = item.quantity;
      });
      setCartItems(map);
    } catch (err) {
      // ignore
    }
  }

  async function handleAddToCart(foodId) {
    if (!user) {
      showToast("Please sign in to add items to cart", "info");
      navigate("/login");
      return;
    }

    setAddingId(foodId);
    try {
      await api.post("/cart", { food_id: foodId, quantity: 1 });
      showToast("Added to cart ✓");
      await fetchCart();
    } catch (err) {
      showToast("Could not add to cart", "error");
    }
    setAddingId(null);
  }

  async function handleUpdateQty(foodId, currentQty, delta) {
    const newQty = currentQty + delta;
    setAddingId(foodId);

    try {
      if (newQty <= 0) {
        const cartRes = await api.get("/cart");
        const match = cartRes.data.items?.find((i) => i.food_id === foodId);
        if (match) {
          await api.delete(`/cart/${match.id}`);
          showToast("Removed from cart");
        }
      } else {
        const cartRes = await api.get("/cart");
        const match = cartRes.data.items?.find((i) => i.food_id === foodId);
        if (match) {
          await api.put(`/cart/${match.id}`, { quantity: newQty });
        } else {
          await api.post("/cart", { food_id: foodId, quantity: 1 });
        }
      }
      await fetchCart();
    } catch (err) {
      showToast("Error updating cart", "error");
    }
    setAddingId(null);
  }

  if (loading) return <Loader text="Loading hotel menu…" />;
  if (!restaurant) return <div className="container"><h2>Hotel not found</h2></div>;

  const totalCartCount = Object.values(cartItems).reduce((a, b) => a + b, 0);
  const foods = restaurant.foods || [];

  // Filter foods by search & veg filter
  const filteredFoods = foods.filter((f) => {
    return !search || f.name.toLowerCase().includes(search.toLowerCase());
  });

  // Group foods by category
  const categoriesMap = {};
  filteredFoods.forEach((f) => {
    const catName = f.category_name || "Main Dishes";
    if (!categoriesMap[catName]) categoriesMap[catName] = [];
    categoriesMap[catName].push(f);
  });

  return (
    <div className="rd-page">

      {/* ── HOTEL HEADER BANNER (SWIGGY STYLE) ──────────────── */}
      <div className="rd-hotel-header">
        <div className="rd-header-content">

          <div className="rd-hotel-main">
            <button className="rd-back-btn" onClick={() => navigate("/")}>
              ← Back to Hotels
            </button>
            <h1 className="rd-hotel-name">{restaurant.name}</h1>
            <p className="rd-hotel-cuisines">{restaurant.cuisines}</p>
            <p className="rd-hotel-addr">📍 {restaurant.address}</p>
          </div>

          {/* Hotel Score Card Box */}
          <div className="rd-score-box">
            <div className="rd-score-rating">
              ★ {Number(restaurant.rating).toFixed(1)}
            </div>
            <div className="rd-score-count">{restaurant.rating_count}</div>
            <div className="rd-score-div" />
            <div className="rd-score-meta">
              <span>⏱️ {restaurant.delivery_time}</span>
              <span>Rs. {restaurant.price_for_two} for two</span>
            </div>
          </div>

        </div>

        {/* Offer Banner */}
        {restaurant.offer_text && (
          <div className="rd-offer-strip">
            🏷️ <strong>Special Hotel Offer:</strong> {restaurant.offer_text}
          </div>
        )}
      </div>

      {/* ── MENU SEARCH & FILTER BAR ───────────────────────── */}
      <div className="rd-controls-bar">
        <div className="rd-search-wrap">
          <span className="rd-search-icon">🔍</span>
          <input
            type="text"
            className="rd-search-input"
            placeholder={`Search dishes in ${restaurant.name}…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── CATEGORIES & FOOD ITEMS LIST ───────────────────── */}
      {Object.keys(categoriesMap).length === 0 ? (
        <div className="rd-empty">
          <span>🍱</span>
          <h3>No dishes found matching search</h3>
        </div>
      ) : (
        <div className="rd-menu-sections">
          {Object.entries(categoriesMap).map(([catName, catFoods]) => (
            <div className="rd-cat-block" key={catName}>
              <h3 className="rd-cat-title">
                {catName} <span className="rd-cat-count">({catFoods.length})</span>
              </h3>

              <div className="rd-foods-grid">
                {catFoods.map((food) => {
                  const qtyInCart = cartItems[food.id] || 0;
                  const isBusy    = addingId === food.id;

                  return (
                    <div className="rd-food-card" key={food.id}>

                      {/* Image Thumbnail */}
                      <div className="rd-food-thumb">
                        {food.image ? (
                          <img
                            src={food.image.startsWith("http") ? food.image : IMG_BASE + food.image}
                            alt={food.name}
                            onError={(e) => { e.target.onerror = null; e.target.src = "/menu-hero.png"; }}
                          />
                        ) : (
                          <span className="rd-food-emoji">🍱</span>
                        )}
                        <span className="rd-veg-dot">🟢</span>
                      </div>

                      {/* Info & Details */}
                      <div className="rd-food-info">
                        <h4 className="rd-food-name">{food.name}</h4>
                        <span className="rd-food-price">Rs. {Number(food.price).toFixed(0)}</span>
                        {food.description && (
                          <p className="rd-food-desc">{food.description}</p>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="rd-food-action">
                        {qtyInCart > 0 ? (
                          <div className="rd-qty-control">
                            <button
                              className="rd-qty-btn"
                              onClick={() => handleUpdateQty(food.id, qtyInCart, -1)}
                              disabled={isBusy}
                            >
                              −
                            </button>
                            <span className="rd-qty-val">{qtyInCart} in Cart</span>
                            <button
                              className="rd-qty-btn"
                              onClick={() => handleUpdateQty(food.id, qtyInCart, 1)}
                              disabled={isBusy}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            className="rd-add-btn"
                            onClick={() => handleAddToCart(food.id)}
                            disabled={isBusy}
                          >
                            + ADD
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ── FLOATING QUICK CART BAR ──────────────────────────── */}
      {totalCartCount > 0 && (
        <div className="floating-cart-bar">
          <div className="floating-cart-info">
            <span className="floating-cart-count">🛒 {totalCartCount} item{totalCartCount > 1 ? "s" : ""} added</span>
            <span className="floating-cart-total">View cart & checkout</span>
          </div>
          <button className="floating-cart-btn" onClick={() => navigate("/cart")}>
            View Cart →
          </button>
        </div>
      )}

    </div>
  );
}

export default RestaurantDetail;
