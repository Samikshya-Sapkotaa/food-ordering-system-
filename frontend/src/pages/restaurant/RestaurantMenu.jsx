import { useState, useEffect } from "react";
import api from "../../api";
import Loader from "../../components/Loader";
import RestaurantNavbar from "../../components/RestaurantNavbar";
import { useToast } from "../../context/ToastContext";
import { getImageUrl } from "../../utils/image";

function RestaurantMenu() {
  const { showToast } = useToast();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isVeg, setIsVeg] = useState(true);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [foodsRes, catRes] = await Promise.all([
        api.get("/foods/all"),
        api.get("/categories"),
      ]);
      setFoods(foodsRes.data);
      setCategories(catRes.data);
      if (catRes.data.length > 0) setCategoryId(catRes.data[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setName("");
    setDescription("");
    setPrice("");
    setIsAvailable(true);
    setIsVeg(true);
    setImageFile(null);
    setImagePreview(null);
    setIsEditing(false);
    setEditId(null);
  }

  function handleEdit(food) {
    setIsEditing(true);
    setEditId(food.id);
    setName(food.name);
    setCategoryId(food.category_id);
    setDescription(food.description || "");
    setPrice(food.price);
    setIsAvailable(Boolean(food.is_available));
    setIsVeg(Boolean(food.is_veg));
    setImageFile(null);
    setImagePreview(food.image ? getImageUrl(food.image) : null);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("category_id", Number(categoryId));
      formData.append("description", description);
      formData.append("price", Number(price));
      formData.append("is_available", isAvailable ? 1 : 0);
      formData.append("is_veg", isVeg ? 1 : 0);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (isEditing) {
        await api.put(`/foods/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("Dish & photo updated successfully!", "success");
      } else {
        await api.post("/foods", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("New dish added with photo!", "success");
      }

      resetForm();
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || "Operation failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleAvailability(food) {
    try {
      await api.put(`/foods/${food.id}/availability`);
      showToast(food.is_available ? `${food.name} marked Out of Stock 🔴` : `${food.name} marked In Stock 🟢`, "info");
      loadData();
    } catch (err) {
      showToast("Failed to toggle availability", "error");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this dish from menu?")) return;
    try {
      await api.delete(`/foods/${id}`);
      showToast("Dish deleted", "info");
      loadData();
    } catch (err) {
      showToast("Failed to delete dish", "error");
    }
  }

  if (loading) return <Loader text="Loading menu..." />;

  return (
    <div>
      <RestaurantNavbar />
      <div style={{ maxWidth: "1100px", margin: "30px auto", padding: "0 20px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
              📖 Menu Item & Dish Photo Management
            </h2>
            <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>
              Add, upload food photos, edit details, or toggle dish availability for your restaurant menu.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>

          {/* Form Box */}
          <div className="card-box" style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
              {isEditing ? "✏️ Edit Dish" : "➕ Add New Dish"}
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Dish Photo Upload */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                  Dish Photo
                </label>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "6px" }} />
                ) : null}
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: "12px" }} />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Dish Name *</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Chicken Steam MoMo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  required
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Category *</label>
                <select
                  className="auth-input"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Price (Rs.) *</label>
                <input
                  type="number"
                  className="auth-input"
                  placeholder="e.g. 250"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  required
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Description</label>
                <textarea
                  className="auth-input"
                  rows={2}
                  placeholder="Brief description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                  <input type="checkbox" checked={isVeg} onChange={(e) => setIsVeg(e.target.checked)} />
                  🌱 Pure Veg
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer" }}>
                  <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
                  ✅ Available
                </label>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, padding: "8px", fontSize: "13px", fontWeight: "800" }}>
                  {submitting ? "Saving..." : isEditing ? "Update Dish" : "Add Dish"}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} className="btn-secondary" style={{ padding: "8px 12px", fontSize: "13px" }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Dishes Table */}
          <div className="card-box" style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
              Current Menu ({foods.length})
            </h3>

            {foods.length === 0 ? (
              <p style={{ color: "#64748b" }}>No dishes added yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {foods.map((food) => (
                  <div key={food.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {food.image ? (
                        <img src={getImageUrl(food.image)} alt={food.name} style={{ width: "48px", height: "48px", borderRadius: "6px", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "48px", height: "48px", borderRadius: "6px", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🍱</div>
                      )}
                      <div>
                        <strong style={{ fontSize: "14px", color: "#0f172a" }}>{food.name}</strong> {food.is_veg ? "🌱" : "🍖"}
                        <div style={{ fontSize: "12px", color: "#64748b" }}>
                          Rs. {food.price} • {food.category_name || "General"}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <button onClick={() => toggleAvailability(food)} style={{ background: food.is_available ? "#dcfce7" : "#fef2f2", color: food.is_available ? "#16a34a" : "#dc2626", border: "none", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", cursor: "pointer" }}>
                        {food.is_available ? "In Stock" : "Out of Stock"}
                      </button>
                      <button onClick={() => handleEdit(food)} style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(food.id)} style={{ background: "#fff1f2", color: "#e11d48", border: "1px solid #fecdd3", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default RestaurantMenu;
