import { useState, useEffect } from "react";
import api from "../../api";
import Loader from "../../components/Loader";
import RestaurantNavbar from "../../components/RestaurantNavbar";
import { useToast } from "../../context/ToastContext";

function RestaurantCategories() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🍽️");
  const [bgColor, setBgColor] = useState("#fff7ed");

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setName("");
    setDescription("");
    setIcon("🍽️");
    setBgColor("#fff7ed");
    setIsEditing(false);
    setEditId(null);
  }

  function handleEdit(cat) {
    setIsEditing(true);
    setEditId(cat.id);
    setName(cat.name);
    setDescription(cat.description || "");
    setIcon(cat.icon || "🍽️");
    setBgColor(cat.bg_color || "#fff7ed");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/categories/${editId}`, {
          name,
          description,
          icon,
          bg_color: bgColor,
        });
        showToast("Category updated successfully ✓", "success");
      } else {
        await api.post("/categories", {
          name,
          description,
          icon,
          bg_color: bgColor,
        });
        showToast("New 'What's on your mind?' category added! ✓", "success");
      }
      resetForm();
      loadCategories();
    } catch (err) {
      showToast(err.response?.data?.message || "Operation failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      showToast("Category deleted", "info");
      loadCategories();
    } catch (err) {
      showToast("Failed to delete category", "error");
    }
  }

  if (loading) return <Loader text="Loading categories..." />;

  return (
    <div>
      <RestaurantNavbar />
      <div style={{ maxWidth: "1000px", margin: "30px auto", padding: "0 20px" }}>

        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
            🗂️ Food Categories & "What's on your mind?" Controls
          </h2>
          <p style={{ color: "#64748b", margin: "4px 0 0 0", fontSize: "14px" }}>
            Add, edit, or remove food categories and icons shown live on the Home page.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>

          {/* Add / Edit Form */}
          <div className="card-box" style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
              {isEditing ? "✏️ Edit Category" : "➕ Add Category"}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Category Name *</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Newari Khaja / Sekuwa & Grill"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Category Emoji Icon</label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="e.g. 🥟 / ☕ / 🍛"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", textAlign: "center", fontSize: "18px" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Home Tag Color</label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    style={{ width: "100%", height: "38px", borderRadius: "6px", border: "1px solid #cbd5e1", cursor: "pointer" }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Description</label>
                <textarea
                  className="auth-input"
                  rows={2}
                  placeholder="Brief category description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, padding: "10px", fontSize: "13px", fontWeight: "800" }}>
                  {submitting ? "Saving..." : isEditing ? "Update Category" : "Add Category"}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} className="btn-secondary" style={{ padding: "10px 14px", fontSize: "13px" }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Categories List */}
          <div className="card-box" style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
              Existing Categories ({categories.length})
            </h3>

            {categories.length === 0 ? (
              <p style={{ color: "#64748b" }}>No categories created yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {categories.map((cat) => (
                  <div key={cat.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: cat.bg_color || "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "22px" }}>{cat.icon || "🍽️"}</span>
                      <div>
                        <strong style={{ fontSize: "15px", color: "#0f172a" }}>{cat.name}</strong>
                        {cat.description && (
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{cat.description}</div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => handleEdit(cat)} style={{ background: "#ffffff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(cat.id)} style={{ background: "#ffffff", color: "#e11d48", border: "1px solid #fecdd3", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
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

export default RestaurantCategories;
