import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

const IMG_BASE = "http://localhost:5000/uploads/";

const emptyForm = {
  category_id: "",
  name: "",
  description: "",
  price: "",
  is_available: true,
};

function AdminFoods() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  
  // selectedRestId: null/empty means viewing Restaurant Cards view. Clicking a restaurant sets selectedRestId!
  const [selectedRestId, setSelectedRestId] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [search, setSearch] = useState("");

  const nameRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    loadInitialData();
  }, [user]);

  async function loadInitialData() {
    try {
      let restData = [];
      try {
        const rRes = await api.get("/restaurants/all");
        restData = Array.isArray(rRes.data) && rRes.data.length > 0 ? rRes.data : (await api.get("/restaurants")).data || [];
      } catch (e) {
        const rRes = await api.get("/restaurants").catch(() => ({ data: [] }));
        restData = rRes.data || [];
      }

      const [foodsRes, catRes] = await Promise.all([
        api.get("/foods/all"),
        api.get("/categories"),
      ]);

      setFoods(foodsRes.data || []);
      setCategories(catRes.data || []);
      setRestaurants(restData);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function openAdd(restId) {
    setEditId(null);
    setForm(emptyForm);
    if (restId) setSelectedRestId(String(restId));
    clearImage();
    setExistingImage(null);
    setPanelOpen(true);
  }

  function startEdit(food) {
    setEditId(food.id);
    setForm({
      category_id: food.category_id,
      name: food.name,
      description: food.description || "",
      price: food.price,
      is_available: food.is_available === 1,
    });
    if (food.restaurant_id) setSelectedRestId(String(food.restaurant_id));
    clearImage();
    setExistingImage(food.image || null);
    setPanelOpen(true);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditId(null);
    clearImage();
    setExistingImage(null);
    setPanelOpen(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("category_id", form.category_id);
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("price", form.price);
      fd.append("is_available", String(form.is_available));
      if (selectedRestId) fd.append("restaurant_id", selectedRestId);
      if (imageFile) fd.append("image", imageFile);

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (editId) {
        await api.put("/foods/" + editId, fd, config);
        showToast("Food dish updated successfully! ✓", "success");
      } else {
        await api.post("/foods", fd, config);
        showToast("New food dish added! ✓", "success");
      }
      resetForm();
      loadInitialData();
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong", "error");
    }
    setSaving(false);
  }

  async function toggleAvailability(food) {
    try {
      await api.put(`/foods/${food.id}/availability`);
      showToast(food.is_available ? "Marked Out of Stock 🔴" : "Marked In Stock 🟢", "info");
      loadInitialData();
    } catch (err) {
      showToast("Could not change availability", "error");
    }
  }

  async function confirmDelete(id) {
    if (!window.confirm("Are you sure you want to delete this dish from the menu?")) return;
    try {
      await api.delete("/foods/" + id);
      showToast("Dish deleted from inventory", "info");
      loadInitialData();
    } catch (err) {
      showToast("Could not delete food item", "error");
    }
  }

  const selectedRest = useMemo(() => {
    if (!selectedRestId) return null;
    return restaurants.find((r) => String(r.id) === String(selectedRestId));
  }, [restaurants, selectedRestId]);

  const filteredFoods = useMemo(() => {
    if (!selectedRestId) return [];
    let list = foods.filter((f) => String(f.restaurant_id) === String(selectedRestId));
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q) ||
          f.category_name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [foods, selectedRestId, search]);

  if (loading) return <Loader text="Loading food inventory..." />;

  return (
    <div style={{ maxWidth: "1150px", margin: "24px auto", padding: "0 20px" }}>

      {/* ── TOP HEADER BANNER ── */}
      <div style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", borderRadius: "16px", padding: "24px", color: "#ffffff", marginBottom: "24px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(249, 115, 22, 0.2)", color: "#fb923c", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "800", marginBottom: "8px" }}>
              👑 ADMIN EXECUTIVE CONTROL
            </div>
            <h2 style={{ fontSize: "26px", fontWeight: "900", margin: 0 }}>
              {selectedRest ? `🏪 ${selectedRest.name} — Menu Inventory` : "🏪 Restaurant Partners Directory"}
            </h2>
            <p style={{ color: "#94a3b8", margin: "6px 0 0 0", fontSize: "14px" }}>
              {selectedRest
                ? `Managing menu items & dishes for ${selectedRest.name}`
                : "Click on any restaurant below to view and manage their specific food dishes"}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {selectedRestId ? (
              <>
                <button onClick={() => setSelectedRestId("")} className="btn-secondary" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "10px 18px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>
                  ← Back to All Restaurants
                </button>
                <button onClick={() => openAdd(selectedRestId)} className="btn-primary" style={{ padding: "10px 20px", borderRadius: "10px", fontWeight: "800", cursor: "pointer" }}>
                  + Add Dish for {selectedRest?.name}
                </button>
              </>
            ) : (
              <button onClick={() => navigate("/admin")} className="btn-secondary" style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", padding: "10px 18px", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>
                ← Back to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── VIEW 1: RESTAURANTS CARDS GRID (When no restaurant is clicked yet) ── */}
      {!selectedRestId && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
              Registered Restaurant Partners ({restaurants.length})
            </h3>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              Click any restaurant card to view its menu items
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
            {restaurants.map((rest) => {
              const restDishes = foods.filter((f) => String(f.restaurant_id) === String(rest.id));
              const imgSrc = rest.image
                ? rest.image.startsWith("http")
                  ? rest.image
                  : IMG_BASE + rest.image
                : null;

              return (
                <div
                  key={rest.id}
                  className="card-box"
                  style={{
                    padding: 0,
                    borderRadius: "16px",
                    overflow: "hidden",
                    border: "1.5px solid #e2e8f0",
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onClick={() => setSelectedRestId(String(rest.id))}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 25px -5px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Restaurant Banner Image */}
                  <div style={{ height: "150px", background: "#f8fafc", position: "relative", overflow: "hidden" }}>
                    {imgSrc ? (
                      <img src={imgSrc} alt={rest.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", background: "linear-gradient(135deg, #f8fafc, #cbd5e1)" }}>
                        🏪
                      </div>
                    )}

                    <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(15, 23, 42, 0.85)", color: "#38bdf8", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "900", backdropFilter: "blur(4px)" }}>
                      {restDishes.length} {restDishes.length === 1 ? "DISH" : "DISHES"}
                    </div>
                  </div>

                  {/* Restaurant Details */}
                  <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h4 style={{ fontSize: "17px", fontWeight: "900", color: "#0f172a", margin: "0 0 4px 0" }}>
                        {rest.name}
                      </h4>
                      <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>
                        {rest.cuisines || "Nepali, Multi-Cuisine"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#475569", display: "flex", alignItems: "center", gap: "4px" }}>
                        📍 {rest.address || "Kathmandu"}
                      </div>
                    </div>

                    <button
                      className="btn-primary"
                      style={{ width: "100%", marginTop: "16px", padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                    >
                      📖 View Food Items ({restDishes.length}) →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── VIEW 2: SINGLE RESTAURANT FOOD DISHES LIST (When a restaurant is clicked) ── */}
      {selectedRestId && (
        <div>
          {/* Breadcrumb & Filter Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div>
              <button
                onClick={() => setSelectedRestId("")}
                style={{ background: "none", border: "none", color: "#2563eb", fontWeight: "800", fontSize: "13px", cursor: "pointer", padding: 0, marginBottom: "4px" }}
              >
                ← Back to All Restaurants
              </button>
              <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                {selectedRest?.name} Menu ({filteredFoods.length} Dishes)
              </h3>
            </div>

            <div style={{ position: "relative", width: "280px" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "13px" }}>🔍</span>
              <input
                type="text"
                placeholder="Search dish name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", padding: "8px 12px 8px 34px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "13px" }}
              />
            </div>
          </div>

          {/* Dishes Grid */}
          {filteredFoods.length === 0 ? (
            <div className="card-box" style={{ padding: "50px", textAlign: "center", color: "#64748b" }}>
              <span style={{ fontSize: "48px", display: "block", marginBottom: "8px" }}>🍱</span>
              <h4 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0 }}>No dishes added for this restaurant yet</h4>
              <p style={{ margin: "6px 0 16px 0", fontSize: "14px" }}>Click below to add the first dish for {selectedRest?.name}.</p>
              <button onClick={() => openAdd(selectedRestId)} className="btn-primary" style={{ padding: "10px 20px", fontWeight: "800" }}>
                + Add Dish to {selectedRest?.name}
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
              {filteredFoods.map((food) => {
                const imgSrc = food.image
                  ? food.image.startsWith("http")
                    ? food.image
                    : IMG_BASE + food.image
                  : null;

                return (
                  <div
                    key={food.id}
                    className="card-box"
                    style={{
                      padding: 0,
                      borderRadius: "14px",
                      overflow: "hidden",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Food Photo Banner */}
                    <div style={{ height: "160px", background: "#f8fafc", position: "relative", overflow: "hidden" }}>
                      {imgSrc ? (
                        <img src={imgSrc} alt={food.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", background: "linear-gradient(135deg, #f8fafc, #e2e8f0)" }}>
                          🍱
                        </div>
                      )}

                      <span
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          fontSize: "11px",
                          fontWeight: "900",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          background: food.is_available ? "rgba(22, 163, 74, 0.9)" : "rgba(220, 38, 38, 0.9)",
                          color: "#ffffff",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {food.is_available ? "🟢 IN STOCK" : "🔴 OUT OF STOCK"}
                      </span>

                      <span
                        style={{
                          position: "absolute",
                          top: "10px",
                          left: "10px",
                          fontSize: "11px",
                          fontWeight: "800",
                          padding: "3px 8px",
                          borderRadius: "8px",
                          background: "rgba(255, 255, 255, 0.95)",
                          color: food.is_veg ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {food.is_veg ? "🌱 PURE VEG" : "🍖 NON-VEG"}
                      </span>
                    </div>

                    {/* Food Details */}
                    <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                          <h4 style={{ fontSize: "16px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                            {food.name}
                          </h4>
                          <span style={{ fontSize: "16px", fontWeight: "900", color: "#16a34a" }}>
                            Rs. {food.price}
                          </span>
                        </div>

                        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>
                          Category: <strong>{food.category_name || "General"}</strong>
                        </div>

                        {food.description && (
                          <p style={{ fontSize: "13px", color: "#64748b", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {food.description}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: "8px", marginTop: "14px", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                        <button
                          onClick={() => toggleAvailability(food)}
                          style={{
                            flex: 1,
                            background: food.is_available ? "#fef2f2" : "#dcfce7",
                            color: food.is_available ? "#dc2626" : "#15803d",
                            border: `1px solid ${food.is_available ? "#fecdd3" : "#bbf7d0"}`,
                            padding: "6px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: "800",
                            cursor: "pointer",
                          }}
                        >
                          {food.is_available ? "Out of Stock" : "In Stock"}
                        </button>

                        <button
                          onClick={() => startEdit(food)}
                          style={{
                            background: "#eff6ff",
                            color: "#2563eb",
                            border: "1px solid #bfdbfe",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => confirmDelete(food.id)}
                          style={{
                            background: "#fff1f2",
                            color: "#dc2626",
                            border: "1px solid #fecdd3",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {panelOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="card-box" style={{ width: "480px", padding: "24px", background: "#ffffff", borderRadius: "16px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "900", color: "#0f172a" }}>
              {editId ? "✏️ Edit Food Dish" : "➕ Add New Dish"}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Target Restaurant Partner *</label>
                <select className="auth-input" value={selectedRestId} onChange={(e) => setSelectedRestId(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                  <option value="">— Select Restaurant —</option>
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Category *</label>
                <select className="auth-input" name="category_id" value={form.category_id} onChange={handleChange} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                  <option value="">— Select Category —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Dish Name *</label>
                <input type="text" className="auth-input" name="name" placeholder="e.g. Chicken Steam MoMo" value={form.name} onChange={handleChange} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Price (Rs.) *</label>
                <input type="number" className="auth-input" name="price" placeholder="e.g. 250" value={form.price} onChange={handleChange} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Description</label>
                <textarea className="auth-input" name="description" placeholder="Short description..." value={form.description} onChange={handleChange} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} rows={2} />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>Dish Photo Upload</label>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: "12px" }} />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, padding: "12px", fontSize: "14px", fontWeight: "800" }}>
                  {saving ? "Saving..." : "Save Dish"}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary" style={{ padding: "12px 18px", fontSize: "14px" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminFoods;
