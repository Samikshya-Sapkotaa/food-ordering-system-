import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useToast } from "../context/ToastContext";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    role: "customer",
    restaurant_name: "",
    cuisine: "",
    pan_number: "",
    dftqc_license: "",
    vat_number: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleRoleSelect(role) {
    setForm((prev) => ({ ...prev, role }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/auth/register", form);
      showToast(res.data.message, "success");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card reg-card">

        <div className="auth-header">
          <span className="auth-icon">📝</span>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-sub">Select your account type and register to get started</p>
        </div>

        {error && <div className="auth-error-banner">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">

          {/* ── ROLE SELECTOR CARDS ── */}
          <div className="auth-form-group">
            <label className="auth-label">Account Type (Role) *</label>
            <div className="role-selector-grid">

              {/* Customer Role */}
              <div
                className={`role-option-card ${form.role === "customer" ? "selected" : ""}`}
                onClick={() => handleRoleSelect("customer")}
                role="button"
                tabIndex={0}
              >
                <span className="role-icon">🛒</span>
                <div className="role-info">
                  <span className="role-title">Customer</span>
                  <span className="role-desc">Order food from best restaurants</span>
                </div>
              </div>

              {/* Restaurant Role */}
              <div
                className={`role-option-card ${form.role === "restaurant" ? "selected" : ""}`}
                onClick={() => handleRoleSelect("restaurant")}
                role="button"
                tabIndex={0}
              >
                <span className="role-icon">🍳</span>
                <div className="role-info">
                  <span className="role-title">Restaurant Partner</span>
                  <span className="role-desc">Register restaurant & submit KYC for Admin approval</span>
                </div>
              </div>

            </div>
          </div>

          <div className="auth-form-row">
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="reg-name">
                {form.role === "restaurant" ? "Owner Full Name *" : "Full Name *"}
              </label>
              <input
                id="reg-name"
                className="auth-input"
                type="text"
                name="name"
                placeholder="e.g. Ramesh Thapa"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="reg-email">Email Address *</label>
              <input
                id="reg-email"
                className="auth-input"
                type="email"
                name="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-form-row">
            <div className="auth-form-group">
              <label className="auth-label" htmlFor="reg-phone">Contact Phone *</label>
              <input
                id="reg-phone"
                className="auth-input"
                type="text"
                name="phone"
                placeholder="+977 9841234567"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label" htmlFor="reg-pass">Password *</label>
              <input
                id="reg-pass"
                className="auth-input"
                type="password"
                name="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-form-group">
            <label className="auth-label" htmlFor="reg-address">Address / Location *</label>
            <textarea
              id="reg-address"
              className="auth-input auth-textarea"
              name="address"
              rows="2"
              placeholder="e.g. Durbar Marg, Kathmandu, Nepal"
              value={form.address}
              onChange={handleChange}
              required
            />
          </div>

          {/* ── RESTAURANT SPECIFIC KYC FIELDS ── */}
          {form.role === "restaurant" && (
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", marginTop: "10px", marginBottom: "14px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", margin: "0 0 12px 0" }}>
                📋 Restaurant Profile & KYC Verification Documents
              </h4>

              <div className="auth-form-row">
                <div className="auth-form-group">
                  <label className="auth-label">Restaurant Business Name *</label>
                  <input
                    className="auth-input"
                    type="text"
                    name="restaurant_name"
                    placeholder="e.g. Himalayan Java Coffee"
                    value={form.restaurant_name}
                    onChange={handleChange}
                    required={form.role === "restaurant"}
                  />
                </div>

                <div className="auth-form-group">
                  <label className="auth-label">Cuisine Types</label>
                  <input
                    className="auth-input"
                    type="text"
                    name="cuisine"
                    placeholder="e.g. Nepali, Bakery, Coffee"
                    value={form.cuisine}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="auth-form-row">
                <div className="auth-form-group">
                  <label className="auth-label">PAN Number (IRD Nepal)</label>
                  <input
                    className="auth-input"
                    type="text"
                    name="pan_number"
                    placeholder="e.g. PAN-601234567"
                    value={form.pan_number}
                    onChange={handleChange}
                  />
                </div>

                <div className="auth-form-group">
                  <label className="auth-label">DFTQC License Number</label>
                  <input
                    className="auth-input"
                    type="text"
                    name="dftqc_license"
                    placeholder="e.g. DFTQC-KTM-99482"
                    value={form.dftqc_license}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="auth-form-group" style={{ marginBottom: 0 }}>
                <label className="auth-label">VAT Registration Number</label>
                <input
                  className="auth-input"
                  type="text"
                  name="vat_number"
                  placeholder="e.g. VAT-609876543"
                  value={form.vat_number}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting ? "Creating Account…" : `Register as ${form.role.toUpperCase()}`}
          </button>

        </form>

        <div className="auth-footer-link">
          Already have an account? <Link to="/login">Sign In →</Link>
        </div>

      </div>
    </div>
  );
}

export default Register;
