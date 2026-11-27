import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

const IMG_BASE = "http://localhost:5000/uploads/";

const emptyFoodForm = {
  category_id: "",
  name: "",
  description: "",
  price: "",
  is_available: true,
};

function HotelPortal() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab]   = useState("orders"); // orders | menu | categories | reviews | settings
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders]         = useState([]);
  const [reviews, setReviews]       = useState([]);
  const [loading, setLoading]       = useState(true);

  // Food Form State
  const [foodForm, setFoodForm]           = useState(emptyFoodForm);
  const [imageFile, setImageFile]         = useState(null);
  const [imagePreview, setImagePreview]   = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [editFoodId, setEditFoodId]       = useState(null);
  const [foodPanelOpen, setFoodPanelOpen] = useState(false);
  const [savingFood, setSavingFood]       = useState(false);

  // Category Form State
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [savingCat, setSavingCat] = useState(false);

  // Report Problem State
  const [reportingOrderId, setReportingOrderId] = useState(null);
  const [problemText, setProblemText]           = useState("");

  // Hotel Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: "",
    cuisines: "",
    offer_text: "",
    address: "",
    delivery_time: "20-25 min",
    price_for_two: 400,
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const fileRef = useRef(null);

  useEffect(() => {
    loadHotelData();
  }, []);

  async function loadHotelData() {
    const hotelId = user?.restaurant_id || 1;
    try {
      const [restRes, foodsRes, catsRes, ordersRes, reviewsRes] = await Promise.all([
        api.get(`/restaurants/${hotelId}`),
        api.get("/foods/all"),
        api.get("/categories"),
        api.get("/orders/all"),
        api.get(`/restaurants/${hotelId}/reviews`).catch(() => ({ data: [] })),
      ]);

      setRestaurant(restRes.data);
      setFoods(foodsRes.data || []);
      setCategories(catsRes.data || []);
      setOrders(ordersRes.data || []);
      setReviews(reviewsRes.data || []);

      setProfileForm({
        name: restRes.data.name || "",
        cuisines: restRes.data.cuisines || "",
        offer_text: restRes.data.offer_text || "",
        address: restRes.data.address || "",
        delivery_time: restRes.data.delivery_time || "20-25 min",
        price_for_two: restRes.data.price_for_two || 400,
      });
    } catch (err) {
    }
    setLoading(false);
  }

  // ── ORDER STATUS UPDATER ──────────────────────────────────
  async function updateOrderStatus(orderId, newStatus) {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      showToast(`Order #${orderId} marked as ${newStatus} ✓`);
      await loadHotelData();
    } catch (err) {
      showToast("Could not update order status", "error");
    }
  }

  // ── REPORT PROBLEM HANDLER ────────────────────────────────
  async function handleReportProblem(orderId) {
    if (!problemText.trim()) {
      showToast("Please enter problem description", "error");
      return;
    }
    try {
      await api.put(`/orders/${orderId}/report-problem`, { problem: problemText });
      showToast("Problem reported to platform support ✓");
      setReportingOrderId(null);
      setProblemText("");
      await loadHotelData();
    } catch (err) {
      showToast("Could not submit problem report", "error");
    }
  }

  // ── CATEGORY MANAGE HANDLERS ──────────────────────────────
  async function handleAddCategory(e) {
    e.preventDefault();
    if (!catName.trim()) return;
    setSavingCat(true);
    try {
      await api.post("/categories", { name: catName, description: catDesc });
      showToast("New category added to kitchen menu ✓");
      setCatName("");
      setCatDesc("");
      await loadHotelData();
    } catch (err) {
      showToast("Could not add category", "error");
    }
    setSavingCat(false);
  }

  // ── FOOD MANAGE HANDLERS ──────────────────────────────────
  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function openAddFood() {
    setEditFoodId(null);
    setFoodForm(emptyFoodForm);
    clearImage();
    setExistingImage(null);
    setFoodPanelOpen(true);
  }

  function startEditFood(food) {
    setEditFoodId(food.id);
    setFoodForm({
      category_id: food.category_id,
      name: food.name,
      description: food.description || "",
      price: food.price,
      is_available: food.is_available === 1,
    });
    clearImage();
    setExistingImage(food.image || null);
    setFoodPanelOpen(true);
  }

  async function handleSaveFood(e) {
    e.preventDefault();
    setSavingFood(true);
    try {
      const fd = new FormData();
      fd.append("category_id",  foodForm.category_id);
      fd.append("name",         foodForm.name);
      fd.append("description",  foodForm.description);
      fd.append("price",        foodForm.price);
      fd.append("is_available", String(foodForm.is_available));
      if (imageFile) fd.append("image", imageFile);

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (editFoodId) {
        await api.put(`/foods/${editFoodId}`, fd, config);
        showToast("Kitchen item updated ✓");
      } else {
        await api.post("/foods", fd, config);
        showToast("New dish added to kitchen menu ✓");
      }

      setFoodPanelOpen(false);
      await loadHotelData();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not save food item", "error");
    }
    setSavingFood(false);
  }

  async function toggleStock(food) {
    try {
      await api.put(`/foods/${food.id}/availability`);
      showToast(food.is_available ? "Marked Sold Out" : "Marked In Stock", "info");
      await loadHotelData();
    } catch (err) {
      showToast("Could not toggle stock", "error");
    }
  }

  async function handleDeleteFood(foodId, name) {
    if (!window.confirm(`Delete dish "${name}" from your kitchen menu?`)) return;
    try {
      await api.delete(`/foods/${foodId}`);
      showToast("Dish removed from menu");
      await loadHotelData();
    } catch (err) {
      showToast("Could not delete dish", "error");
    }
  }

  // ── PROFILE UPDATE HANDLER ────────────────────────────────
  async function handleSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    const hotelId = user?.restaurant_id || 1;
    try {
      await api.put(`/restaurants/${hotelId}`, profileForm);
      showToast("Hotel profile & settings updated ✓");
      await loadHotelData();
    } catch (err) {
      showToast(err.response?.data?.message || "Could not update hotel profile", "error");
    }
    setSavingProfile(false);
  }

  if (loading) return <Loader text="Loading your Swiggy partner hotel kitchen portal…" />;

  const activeKitchenOrders = orders.filter(o => !["Delivered", "Cancelled"].includes(o.status));

  return (
    <div className="hp-page">

      {/* ── HOTEL PARTNER KITCHEN HEADER ────────────────────── */}
      <div className="hp-header-card">
        <div className="hp-header-left">
          <span className="hp-icon">🏨</span>
          <div>
            <div className="hp-tag-row">
              <span className="hp-tag">SWIGGY PARTNER KITCHEN</span>
              <span className="hp-rating">★ {restaurant?.rating || 4.8}</span>
            </div>
            <h2 className="hp-name">{restaurant?.name || "Hotel Partner Kitchen"}</h2>
            <p className="hp-cuisines">Cuisines: <strong>{restaurant?.cuisines || "Nepali, Indian"}</strong></p>
            <p className="hp-addr">📍 Location: {restaurant?.address} • ⏱️ {restaurant?.delivery_time}</p>
          </div>
        </div>

        <div className="hp-header-right">
          <div className="hp-quick-stat">
            <span className="stat-val">{orders.length}</span>
            <span className="stat-lbl">Kitchen Orders</span>
          </div>
          <div className="hp-quick-stat">
            <span className="stat-val green">{foods.length}</span>
            <span className="stat-lbl">My Dishes</span>
          </div>
          <div className="hp-quick-stat">
            <span className="stat-val blue">{reviews.length}</span>
            <span className="stat-lbl">Reviews</span>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS ─────────────────────────────────── */}
      <div className="hp-tabs-bar">
        <Link
          to="/hotel/kitchen"
          className="hp-tab"
          style={{
            background: "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
            color: "#ffffff",
            fontWeight: "800",
            textDecoration: "none",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(234, 88, 12, 0.3)"
          }}
        >
          🍳 Full Kitchen KDS Dashboard →
        </Link>

        <button
          className={`hp-tab ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          📦 Kitchen Orders
          {activeKitchenOrders.length > 0 && (
            <span className="hp-tab-badge">{activeKitchenOrders.length} Active</span>
          )}
        </button>

        <button
          className={`hp-tab ${activeTab === "menu" ? "active" : ""}`}
          onClick={() => setActiveTab("menu")}
        >
          🍱 My Dishes ({foods.length})
        </button>

        <button
          className={`hp-tab ${activeTab === "categories" ? "active" : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          🗂️ Categories ({categories.length})
        </button>

        <button
          className={`hp-tab ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          ⭐ User Reviews ({reviews.length})
        </button>

        <button
          className={`hp-tab ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          ⚙️ Profile & Settings
        </button>
      </div>

      {/* ── TAB 1: KITCHEN ORDERS SYSTEM (DELIVERY_PARTNER STATUS, USER REQUESTS, PREPAID/COD, PROBLEM LOG) ── */}
      {activeTab === "orders" && (
        <div className="hp-section">
          <div className="hp-sec-head">
            <h3>📦 Incoming Kitchen Orders & Delivery Logistics</h3>
            <p>Monitor customer requests, payment types, deliveryPartner status, and report order issues</p>
          </div>

          {orders.length === 0 ? (
            <div className="hp-empty">
              <span className="hp-empty-icon">📦</span>
              <h3>No incoming kitchen orders yet</h3>
              <p>When customers order from your hotel, orders will appear here in real-time.</p>
            </div>
          ) : (
            <div className="hp-orders-list">
              {orders.map((order, idx) => {
                const isPrepaid = ["eSewa Wallet", "Khalti Wallet", "ConnectIPS", "Online Card"].includes(order.payment_method);

                return (
                  <div className="hp-order-card" key={order.id} style={{ "--i": idx }}>

                    {/* Top Bar: Order ID, Status Tag, Payment Type Badge */}
                    <div className="hp-card-top">
                      <div>
                        <span className="hp-order-id">Order #{order.id}</span>
                        <span className={`hp-pay-badge ${isPrepaid ? "prepaid" : "cod"}`}>
                          {isPrepaid ? "💳 PREPAID ONLINE" : "💵 COD / POSTPAID"}
                        </span>
                      </div>
                      <span className={`hp-status-tag ${order.status.toLowerCase().replace(/\s+/g, "-")}`}>
                        {order.status}
                      </span>
                      <div className="hp-price">Rs. {Number(order.total_amount).toFixed(0)}</div>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="hp-cust-box">
                      <span>👤 Customer: <strong>{order.customer_name}</strong> (+977 {order.phone})</span>
                      <span>📍 Kathmandu Address: <strong>{order.address}</strong></span>
                      <span>💳 Payment Gateway: <strong>{order.payment_method}</strong></span>
                      {order.special_instructions && (
                        <div className="hp-user-request-box">
                          📝 <strong>Customer Request / Cooking Instructions:</strong> "{order.special_instructions}"
                        </div>
                      )}
                    </div>

                    {/* Delivery Delivery Partner Status Box */}
                    <div className="hp-deliveryPartner-box">
                      <span className="hp-deliveryPartner-icon">🛵</span>
                      <div>
                        <h4 className="hp-deliveryPartner-title">Delivery Partner Status</h4>
                        <p className="hp-deliveryPartner-text">
                          Assigned Delivery Partner: <strong>{order.deliveryPartner_name || "Ram Shrestha Delivery Partner"}</strong> (+977 {order.deliveryPartner_phone || "9841234567"})
                        </p>
                        <p className="hp-deliveryPartner-sub">
                          Current Ride Status: <strong className="highlight">{order.status}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Reported Problem Notification (if any) */}
                    {order.problem_reported && (
                      <div className="hp-problem-box">
                        ⚠️ <strong>Reported Issue:</strong> {order.problem_reported}
                      </div>
                    )}

                    {/* Order Items Table */}
                    <div className="hp-items-table">
                      {order.items?.map(item => (
                        <div className="hp-item-row" key={item.id}>
                          <span className="name">🍽️ {item.food_name}</span>
                          <span className="qty">×{item.quantity}</span>
                          <span className="sub">Rs. {(item.price * item.quantity).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Acceptance Action Buttons + Report Problem */}
                    <div className="hp-actions-bar">
                      <div className="hp-btn-group">
                        {order.status === "Pending" && (
                          <button
                            className="hp-action-btn accept"
                            onClick={() => updateOrderStatus(order.id, "Confirmed")}
                          >
                            ✅ Accept Order (Confirm)
                          </button>
                        )}

                        {order.status === "Confirmed" && (
                          <button
                            className="hp-action-btn cook"
                            onClick={() => updateOrderStatus(order.id, "Preparing")}
                          >
                            🍳 Start Cooking (Preparing)
                          </button>
                        )}

                        {order.status === "Preparing" && (
                          <button
                            className="hp-action-btn ready"
                            onClick={() => updateOrderStatus(order.id, "Ready for Pickup")}
                          >
                            📦 Mark Ready for Delivery Partner Pickup
                          </button>
                        )}
                      </div>

                      {/* Report Problem Button */}
                      <button
                        className="hp-report-btn"
                        onClick={() => setReportingOrderId(reportingOrderId === order.id ? null : order.id)}
                      >
                        ⚠️ Report Issue
                      </button>
                    </div>

                    {/* Report Problem Modal/Form */}
                    {reportingOrderId === order.id && (
                      <div className="hp-report-form">
                        <label>Describe issue with Order #{order.id}:</label>
                        <input
                          type="text"
                          placeholder="e.g. Item out of stock, Delivery Partner delayed, Customer requested edit"
                          value={problemText}
                          onChange={e => setProblemText(e.target.value)}
                        />
                        <div className="btns">
                          <button className="submit" onClick={() => handleReportProblem(order.id)}>Submit Report</button>
                          <button className="cancel" onClick={() => setReportingOrderId(null)}>Cancel</button>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: MANAGE MY HOTEL MENU (OWN ITEMS ONLY) ─────── */}
      {activeTab === "menu" && (
        <div className="hp-section">
          <div className="hp-sec-head">
            <div>
              <h3>🍱 Manage My Hotel Menu</h3>
              <p>Add new dishes, upload food photos, set prices, and control stock availability</p>
            </div>
            <button className="hp-add-btn" onClick={openAddFood}>
              + Add New Dish
            </button>
          </div>

          <div className="hp-menu-grid">
            {foods.length === 0 ? (
              <div className="hp-empty">
                <span className="hp-empty-icon">🍳</span>
                <h3>No dishes in your kitchen menu</h3>
                <button className="hp-add-btn" onClick={openAddFood}>Add First Dish</button>
              </div>
            ) : (
              foods.map((food) => (
                <div className="hp-food-card" key={food.id}>
                  <div className="hp-food-thumb">
                    {food.image ? (
                      <img src={IMG_BASE + food.image} alt={food.name} />
                    ) : (
                      <span>🍱</span>
                    )}
                    <button
                      className={`hp-stock-toggle ${food.is_available ? "in" : "out"}`}
                      onClick={() => toggleStock(food)}
                    >
                      {food.is_available ? "✓ In Stock" : "✕ Sold Out"}
                    </button>
                  </div>

                  <div className="hp-food-details">
                    <span className="cat">{food.category_name}</span>
                    <h4 className="name">{food.name}</h4>
                    <p className="desc">{food.description || "No description."}</p>
                    <div className="hp-food-footer">
                      <span className="price">Rs. {Number(food.price).toFixed(0)}</span>
                      <div className="btns">
                        <button onClick={() => startEditFood(food)}>✏️ Edit</button>
                        <button className="del" onClick={() => handleDeleteFood(food.id, food.name)}>🗑️</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: MANAGE CATEGORIES (KITCHEN ADD CATEGORY) ──── */}
      {activeTab === "categories" && (
        <div className="hp-section">
          <div className="hp-sec-head">
            <h3>🗂️ Manage Kitchen Food Categories</h3>
            <p>Create and customize food categories for your restaurant menu</p>
          </div>

          {/* Add Category Form */}
          <form onSubmit={handleAddCategory} className="hp-cat-form">
            <h4>➕ Add Custom Kitchen Category</h4>
            <div className="hp-form-row">
              <input
                className="hp-input"
                type="text"
                placeholder="Category Name (e.g. Newari Snacks, Hot Beverages)"
                value={catName}
                onChange={e => setCatName(e.target.value)}
                required
              />
              <input
                className="hp-input"
                type="text"
                placeholder="Description (optional)"
                value={catDesc}
                onChange={e => setCatDesc(e.target.value)}
              />
              <button type="submit" className="hp-save-btn" disabled={savingCat}>
                {savingCat ? "Adding…" : "Add Category"}
              </button>
            </div>
          </form>

          {/* Categories Grid */}
          <div className="hp-cat-grid">
            {categories.map(cat => (
              <div className="hp-cat-card" key={cat.id}>
                <span className="icon">🍽️</span>
                <div className="info">
                  <h4>{cat.name}</h4>
                  <p>{cat.description || "Active category"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: USER REVIEWS & FEEDBACK ──────────────────── */}
      {activeTab === "reviews" && (
        <div className="hp-section">
          <div className="hp-sec-head">
            <h3>⭐ Customer Ratings & Dish Feedback</h3>
            <p>Read what Kathmandu food lovers say about your hotel's food and service</p>
          </div>

          {reviews.length === 0 ? (
            <div className="hp-empty">
              <span className="hp-empty-icon">⭐</span>
              <h3>No reviews yet</h3>
              <p>Customer reviews will appear here when orders are completed.</p>
            </div>
          ) : (
            <div className="hp-reviews-list">
              {reviews.map(rev => (
                <div className="hp-review-card" key={rev.id}>
                  <div className="rev-head">
                    <span className="rev-user">👤 {rev.user_name}</span>
                    <span className="rev-stars">{"⭐".repeat(rev.rating)} ({rev.rating}/5)</span>
                  </div>
                  <p className="rev-comment">"{rev.comment}"</p>
                  <span className="rev-date">🗓️ {new Date(rev.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: HOTEL PROFILE SETTINGS ───────────────────── */}
      {activeTab === "settings" && (
        <div className="hp-section">
          <div className="hp-sec-head">
            <h3>⚙️ Hotel Profile & Swiggy Partner Settings</h3>
            <p>Update your hotel name, cuisines, Kathmandu address, and special offer banners</p>
          </div>

          <form onSubmit={handleSaveProfile} className="hp-settings-form">
            <div className="hp-form-group">
              <label>Hotel / Restaurant Name *</label>
              <input
                className="hp-input"
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
              />
            </div>

            <div className="hp-form-row">
              <div className="hp-form-group">
                <label>Cuisines (comma separated) *</label>
                <input
                  className="hp-input"
                  type="text"
                  placeholder="e.g. Nepali Thali, Newari, North Indian"
                  value={profileForm.cuisines}
                  onChange={(e) => setProfileForm({ ...profileForm, cuisines: e.target.value })}
                  required
                />
              </div>

              <div className="hp-form-group">
                <label>Kathmandu Address *</label>
                <input
                  className="hp-input"
                  type="text"
                  placeholder="e.g. Durbar Marg, Kathmandu"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="hp-form-row">
              <div className="hp-form-group">
                <label>Estimated Delivery Time</label>
                <input
                  className="hp-input"
                  type="text"
                  placeholder="20-25 min"
                  value={profileForm.delivery_time}
                  onChange={(e) => setProfileForm({ ...profileForm, delivery_time: e.target.value })}
                />
              </div>

              <div className="hp-form-group">
                <label>Price for Two (Rs.)</label>
                <input
                  className="hp-input"
                  type="number"
                  placeholder="400"
                  value={profileForm.price_for_two}
                  onChange={(e) => setProfileForm({ ...profileForm, price_for_two: e.target.value })}
                />
              </div>
            </div>

            <div className="hp-form-group">
              <label>Special Offer Banner Text</label>
              <input
                className="hp-input"
                type="text"
                placeholder="e.g. 15% OFF | Code KATHMANDU15"
                value={profileForm.offer_text}
                onChange={(e) => setProfileForm({ ...profileForm, offer_text: e.target.value })}
              />
            </div>

            <button type="submit" className="hp-save-btn" disabled={savingProfile}>
              {savingProfile ? "Saving Profile…" : "Save Hotel Settings ✓"}
            </button>
          </form>
        </div>
      )}

      {/* ── ADD/EDIT FOOD MODAL ──────────────────────────────── */}
      {foodPanelOpen && (
        <div className="af-backdrop" onClick={e => { if (e.target === e.currentTarget) setFoodPanelOpen(false); }}>
          <div className="af-panel" role="dialog">
            <div className="af-panel-header">
              <h3>{editFoodId ? "✏️ Edit Kitchen Dish" : "➕ Add Kitchen Dish"}</h3>
              <button className="af-panel-close" onClick={() => setFoodPanelOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveFood} className="af-form" encType="multipart/form-data">
              <div className="af-form-group">
                <label className="af-label">Dish Photo Upload *</label>
                <div
                  className={`af-img-drop ${imagePreview || existingImage ? "has-img" : ""}`}
                  onClick={() => fileRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="af-img-preview" />
                  ) : existingImage ? (
                    <img src={IMG_BASE + existingImage} alt="current" className="af-img-preview" />
                  ) : (
                    <div className="af-img-placeholder">
                      <span className="af-img-icon">📷</span>
                      <span className="af-img-hint">Click to upload dish photo</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </div>

              <div className="af-form-row">
                <div className="af-form-group">
                  <label className="af-label">Category *</label>
                  <select
                    className="af-input"
                    name="category_id"
                    value={foodForm.category_id}
                    onChange={(e) => setFoodForm({ ...foodForm, category_id: e.target.value })}
                    required
                  >
                    <option value="">— Select Category —</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="af-form-group">
                  <label className="af-label">Price (Rs.) *</label>
                  <input
                    className="af-input"
                    type="number"
                    name="price"
                    placeholder="250"
                    value={foodForm.price}
                    onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="af-form-group">
                <label className="af-label">Dish Name *</label>
                <input
                  className="af-input"
                  type="text"
                  name="name"
                  placeholder="e.g. Special Chicken Momo"
                  value={foodForm.name}
                  onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="af-form-group">
                <label className="af-label">Description</label>
                <textarea
                  className="af-input af-textarea"
                  name="description"
                  placeholder="Short description"
                  value={foodForm.description}
                  onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="af-avail-row">
                <span>Available for Orders</span>
                <button
                  type="button"
                  className={`af-toggle ${foodForm.is_available ? "on" : "off"}`}
                  onClick={() => setFoodForm(f => ({ ...f, is_available: !f.is_available }))}
                >
                  <span className="af-toggle-knob" />
                </button>
              </div>

              <div className="af-form-actions">
                <button type="submit" className="af-save-btn" disabled={savingFood}>
                  {savingFood ? "Saving…" : editFoodId ? "Update Dish" : "Save Dish"}
                </button>
                <button type="button" className="af-cancel-btn" onClick={() => setFoodPanelOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default HotelPortal;
