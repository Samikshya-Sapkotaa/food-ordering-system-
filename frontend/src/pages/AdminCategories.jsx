import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Loader from "../components/Loader";
import { useToast } from "../context/ToastContext";

/* emoji options the admin can pick for a category */
const EMOJI_OPTIONS = ["🥗", "🍛", "🍕", "🥤", "🍮", "🍜", "🍱", "🥩", "🌮", "🍔", "🥞", "🍣", "☕", "🧁", "🍲"];

/* gradient palette — cycles through these for cards */
const GRADIENTS = [
  "linear-gradient(135deg,#f6d365 0%,#fda085 100%)",
  "linear-gradient(135deg,#f093fb 0%,#f5576c 100%)",
  "linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)",
  "linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)",
  "linear-gradient(135deg,#fa709a 0%,#fee140 100%)",
  "linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)",
  "linear-gradient(135deg,#fccb90 0%,#d57eeb 100%)",
];

function getGradient(index) {
  return GRADIENTS[index % GRADIENTS.length];
}

/* pick a sensible default emoji for a category name */
const NAME_EMOJI_MAP = {
  starters: "🥗",
  "main course": "🍛",
  "pizza & burger": "🍕",
  beverages: "🥤",
  desserts: "🍮",
};
function guessEmoji(name) {
  return NAME_EMOJI_MAP[name?.toLowerCase()] ?? "🍽️";
}

function AdminCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🍽️");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // id to confirm
  const [panelOpen, setPanelOpen] = useState(false);
  const nameRef = useRef(null);

  const { showToast } = useToast();

  useEffect(() => { loadCategories(); }, []);

  /* focus name field whenever panel opens */
  useEffect(() => {
    if (panelOpen) setTimeout(() => nameRef.current?.focus(), 80);
  }, [panelOpen]);

  async function loadCategories() {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
    }
    setLoading(false);
  }

  function resetForm() {
    setName("");
    setDescription("");
    setEmoji("🍽️");
    setEditId(null);
    setPanelOpen(false);
  }

  function openAdd() {
    setEditId(null);
    setName("");
    setDescription("");
    setEmoji("🍽️");
    setPanelOpen(true);
  }

  function startEdit(cat) {
    setEditId(cat.id);
    setName(cat.name);
    setDescription(cat.description || "");
    setEmoji(guessEmoji(cat.name));
    setPanelOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await api.put("/categories/" + editId, { name, description });
        showToast("Category updated ✓");
      } else {
        await api.post("/categories", { name, description });
        showToast("Category added ✓");
      }
      resetForm();
      loadCategories();
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong", "error");
    }
    setSaving(false);
  }

  async function confirmDelete(id) {
    try {
      await api.delete("/categories/" + id);
      showToast("Category deleted");
      setDeleteConfirm(null);
      loadCategories();
    } catch (err) {
      showToast("Could not delete category", "error");
      setDeleteConfirm(null);
    }
  }

  return (
    <div className="ac-page">

      {/* ── PAGE HEADER ─────────────────────────────────────── */}
      <div className="ac-header">
        <div className="ac-header-left">
          <span className="ac-header-icon">🗂️</span>
          <div>
            <h2 className="ac-title">Manage Categories</h2>
            <p className="ac-subtitle">Organise your menu by food type</p>
          </div>
        </div>
        <button className="ac-add-btn" onClick={openAdd} id="add-category-btn">
          <span className="ac-add-icon">+</span>
          New Category
        </button>
        <button
          onClick={() => navigate("/admin")}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "#f8fafc", border: "1.5px solid #e2e8f0",
            borderRadius: "10px", padding: "9px 18px",
            fontSize: "13px", fontWeight: "700", color: "#334155",
            cursor: "pointer", transition: "all 0.18s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#eff6ff"; e.currentTarget.style.borderColor = "#bfdbfe"; e.currentTarget.style.color = "#1d4ed8"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#334155"; }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* ── STAT STRIP ─────────────────────────────────────── */}
      {!loading && (
        <div className="ac-stat-strip">
          <div className="ac-stat">
            <span className="ac-stat-num">{categories.length}</span>
            <span className="ac-stat-label">Total Categories</span>
          </div>
          <div className="ac-stat-div" />
          <div className="ac-stat">
            <span className="ac-stat-num">
              {categories.reduce((s) => s + 1, 0) > 0 ? "Active" : "—"}
            </span>
            <span className="ac-stat-label">Status</span>
          </div>
          <div className="ac-stat-div" />
          <div className="ac-stat">
            <span className="ac-stat-num">
              {categories.map(c => guessEmoji(c.name)).join(" ")}
            </span>
            <span className="ac-stat-label">Your Categories</span>
          </div>
        </div>
      )}

      {/* ── SLIDE-IN PANEL ─────────────────────────────────── */}
      {panelOpen && (
        <div className="ac-panel-backdrop" onClick={(e) => { if (e.target === e.currentTarget) resetForm(); }}>
          <div className="ac-panel" role="dialog" aria-modal="true" aria-label={editId ? "Edit Category" : "Add Category"}>

            <div className="ac-panel-header">
              <h3>{editId ? "✏️  Edit Category" : "➕  New Category"}</h3>
              <button className="ac-panel-close" onClick={resetForm} aria-label="Close">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="ac-form">

              {/* emoji picker */}
              <div className="ac-form-group">
                <label className="ac-label">Category Icon</label>
                <div className="ac-emoji-grid">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      className={`ac-emoji-btn ${emoji === e ? "selected" : ""}`}
                      onClick={() => setEmoji(e)}
                      aria-label={`Select emoji ${e}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* name */}
              <div className="ac-form-group">
                <label className="ac-label" htmlFor="cat-name">Category Name *</label>
                <input
                  id="cat-name"
                  ref={nameRef}
                  className="ac-input"
                  type="text"
                  placeholder="e.g. Main Course"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!editId) setEmoji(guessEmoji(e.target.value) || emoji);
                  }}
                  required
                />
              </div>

              {/* description */}
              <div className="ac-form-group">
                <label className="ac-label" htmlFor="cat-desc">Description</label>
                <input
                  id="cat-desc"
                  className="ac-input"
                  type="text"
                  placeholder="Short description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* preview */}
              <div className="ac-preview">
                <span className="ac-preview-label">Preview</span>
                <div className="ac-preview-pill">
                  <span>{emoji}</span>
                  <span>{name || "Category Name"}</span>
                </div>
              </div>

              <div className="ac-form-actions">
                <button type="submit" className="ac-save-btn" disabled={saving} id={editId ? "update-category-btn" : "save-category-btn"}>
                  {saving ? <span className="ac-spinner" /> : null}
                  {saving ? "Saving…" : editId ? "Update Category" : "Add Category"}
                </button>
                <button type="button" className="ac-cancel-btn" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CATEGORY CARDS ─────────────────────────────────── */}
      {loading ? (
        <Loader text="Loading categories…" />
      ) : categories.length === 0 ? (
        <div className="ac-empty">
          <span className="ac-empty-icon">🗂️</span>
          <p>No categories yet.</p>
          <button className="ac-add-btn" onClick={openAdd}>Add Your First Category</button>
        </div>
      ) : (
        <div className="ac-grid">
          {categories.map((cat, i) => (
            <div
              className="ac-card"
              key={cat.id}
              style={{ "--i": i }}
            >
              {/* coloured top strip */}
              <div className="ac-card-banner" style={{ background: getGradient(i) }}>
                <span className="ac-card-emoji">{guessEmoji(cat.name)}</span>
                <span className="ac-card-id">#{cat.id}</span>
              </div>

              <div className="ac-card-body">
                <h4 className="ac-card-name">{cat.name}</h4>
                <p className="ac-card-desc">
                  {cat.description || <span className="ac-card-no-desc">No description</span>}
                </p>

                <div className="ac-card-actions">
                  <button
                    className="ac-edit-btn"
                    onClick={() => startEdit(cat)}
                    id={`edit-cat-${cat.id}`}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="ac-del-btn"
                    onClick={() => setDeleteConfirm(cat.id)}
                    id={`delete-cat-${cat.id}`}
                  >
                    🗑️ Delete
                  </button>
                </div>

                {/* inline delete confirmation */}
                {deleteConfirm === cat.id && (
                  <div className="ac-del-confirm">
                    <p>⚠️ Delete <strong>{cat.name}</strong>? All food items inside it will also be removed.</p>
                    <div className="ac-del-confirm-btns">
                      <button className="ac-del-confirm-yes" onClick={() => confirmDelete(cat.id)}>
                        Yes, Delete
                      </button>
                      <button className="ac-del-confirm-no" onClick={() => setDeleteConfirm(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminCategories;
