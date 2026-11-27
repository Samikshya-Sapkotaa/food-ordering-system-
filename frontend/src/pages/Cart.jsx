import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import Loader from "../components/Loader";

const IMG_BASE = "http://localhost:5000/uploads/";

const CATEGORY_ICONS = {
  starters: "🥗",
  "main course": "🍛",
  "pizza & burger": "🍕",
  beverages: "🥤",
  desserts: "🍮",
};
function getCatIcon(name) {
  return CATEGORY_ICONS[name?.toLowerCase()] ?? "🍽️";
}

function Cart() {
  const [items, setItems]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null); // id of item currently updating

  const navigate = useNavigate();

  function groupItemsByRestaurant(cartItems) {
    const groups = new Map();

    cartItems.forEach((item) => {
      const key = item.restaurant_name || "Other Restaurant";
      if (!groups.has(key)) {
        groups.set(key, { restaurant_name: key, items: [] });
      }
      groups.get(key).items.push(item);
    });

    return Array.from(groups.values());
  }

  const groupedItems = groupItemsByRestaurant(items);

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    try {
      const res = await api.get("/cart");
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
    }
    setLoading(false);
  }

  async function changeQuantity(cartId, action) {
    setUpdatingId(cartId);
    try {
      await api.put("/cart/" + cartId, { action });
      await loadCart();
    } catch (err) {
    }
    setUpdatingId(null);
  }

  async function removeItem(cartId) {
    setUpdatingId(cartId);
    try {
      await api.delete("/cart/" + cartId);
      await loadCart();
    } catch (err) {
    }
    setUpdatingId(null);
  }

  async function clearCart() {
    if (!window.confirm("Remove all items from cart?")) return;
    setLoading(true);
    try {
      await api.delete("/cart");
      await loadCart();
    } catch (err) {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loader text="Loading your cart…" />;
  }

  /* ── Empty State ── */
  if (items.length === 0) {
    return (
      <div className="mc-page">
        <div className="mc-header">
          <div className="mc-header-left">
            <span className="mc-header-icon">🛒</span>
            <div>
              <h2 className="mc-title">My Cart</h2>
              <p className="mc-subtitle">Your shopping cart is currently empty</p>
            </div>
          </div>
        </div>

        <div className="mc-empty">
          <span className="mc-empty-icon">🍽️</span>
          <h3 className="mc-empty-title">Your Cart is Empty</h3>
          <p className="mc-empty-text">
            Looks like you haven't added anything to your cart yet. Explore our menu and pick something delicious!
          </p>
          <Link to="/" className="mc-browse-btn">
            Explore Menu →
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = Number(total);
  const deliveryFee = subtotal > 500 ? 0 : 40;
  const grandTotal = subtotal + deliveryFee;
  const totalItemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="mc-page">

      {/* ── PAGE HEADER ─────────────────────────────────────── */}
      <div className="mc-header">
        <div className="mc-header-left">
          <span className="mc-header-icon">🛒</span>
          <div>
            <h2 className="mc-title">My Cart</h2>
            <p className="mc-subtitle">
              {totalItemCount} item{totalItemCount === 1 ? "" : "s"} selected
            </p>
          </div>
        </div>

        <div className="mc-header-actions">
          <button className="mc-clear-btn" onClick={clearCart} title="Clear all items">
            🗑️ Clear Cart
          </button>
          <Link to="/" className="mc-add-more-btn">
            + Add More Items
          </Link>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ────────────────────────────────── */}
      <div className="mc-grid">

        {/* ── LEFT: CART ITEMS LIST ─────────────────────────── */}
        <div className="mc-items-col">
          {groupedItems.map((group, groupIndex) => {
            const groupSubtotal = group.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

            return (
              <div key={groupIndex} className="mc-restaurant-group">
                <div className="mc-group-header">
                  <div>
                    <h3>{group.restaurant_name}</h3>
                    <p>{group.items.length} item{group.items.length === 1 ? "" : "s"} from this restaurant</p>
                  </div>
                  <div className="mc-group-subtotal">Subtotal: Rs. {groupSubtotal.toFixed(0)}</div>
                </div>

                {group.items.map((item, index) => {
                  const hasImg = !!item.image;
                  const isUpdating = updatingId === item.id;

                  return (
                    <div
                      className={`mc-item-card ${isUpdating ? "updating" : ""}`}
                      key={item.id}
                      style={{ "--i": index }}
                    >
                      {/* Food Image / Icon */}
                      <div className="mc-item-img-wrap">
                        {hasImg ? (
                          <img
                            src={item.image.startsWith("http") ? item.image : IMG_BASE + item.image}
                            alt={item.name}
                            className="mc-item-img"
                          />
                        ) : (
                          <span className="mc-item-emoji">
                            {getCatIcon(item.category_name)}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="mc-item-info">
                        {item.category_name && (
                          <span className="mc-item-cat">
                            {getCatIcon(item.category_name)} {item.category_name}
                          </span>
                        )}
                        <h4 className="mc-item-name">{item.name}</h4>
                        {item.restaurant_name && (
                          <div style={{ fontSize: "11px", fontWeight: "800", color: "#2563eb", marginTop: "2px" }}>
                            🏪 {item.restaurant_name}
                          </div>
                        )}
                        <div className="mc-item-unit-price">
                          Rs. {Number(item.price).toFixed(0)} / item
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="mc-item-qty-box">
                        <button
                          className="mc-qty-btn"
                          onClick={() => changeQuantity(item.id, "decrease")}
                          disabled={isUpdating}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="mc-qty-val" key={item.quantity}>
                          {item.quantity}
                        </span>
                        <button
                          className="mc-qty-btn"
                          onClick={() => changeQuantity(item.id, "increase")}
                          disabled={isUpdating}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal & Delete */}
                      <div className="mc-item-right">
                        <div className="mc-item-subtotal">
                          Rs. {(item.price * item.quantity).toFixed(0)}
                        </div>
                        <button
                          className="mc-remove-btn"
                          onClick={() => removeItem(item.id)}
                          disabled={isUpdating}
                          title="Remove item"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* ── RIGHT: ORDER SUMMARY STICKY SIDEBAR ──────────── */}
        <div className="mc-summary-col">
          <div className="mc-summary-card">
            <h3 className="mc-summary-title">Order Summary</h3>

            <div className="mc-summary-rows">
              <div className="mc-summary-row">
                <span>Items Subtotal ({totalItemCount})</span>
                <span>Rs. {subtotal.toFixed(0)}</span>
              </div>

              <div className="mc-summary-row">
                <span>Delivery Fee</span>
                {deliveryFee === 0 ? (
                  <span className="mc-free-tag">FREE</span>
                ) : (
                  <span>Rs. {deliveryFee}</span>
                )}
              </div>

              {subtotal <= 500 && (
                <div className="mc-promo-hint">
                  💡 Add Rs. {(501 - subtotal).toFixed(0)} more to get <strong>FREE Delivery</strong>!
                </div>
              )}
            </div>

            <div className="mc-summary-divider" />

            <div className="mc-summary-row mc-grand-total">
              <span>Grand Total</span>
              <span className="mc-total-amount">Rs. {grandTotal.toFixed(0)}</span>
            </div>

            {groupedItems.length > 1 && (
              <div className="mc-multiple-orders-note">
                ⚠️ Your cart contains items from {groupedItems.length} restaurants. Checkout will create a separate order for each restaurant.
              </div>
            )}

            <button
              className="mc-checkout-btn"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout →
            </button>

            {/* Trust Badges */}
            <div className="mc-trust-badges">
              <div className="mc-badge-item">
                <span>🔒</span> 100% Secure Checkout
              </div>
              <div className="mc-badge-item">
                <span>⚡</span> Express Hot Delivery
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Cart;
