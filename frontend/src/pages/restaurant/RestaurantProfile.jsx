import { useState, useEffect } from "react";
import api from "../../api";
import Loader from "../../components/Loader";
import RestaurantNavbar from "../../components/RestaurantNavbar";
import { useToast } from "../../context/ToastContext";
import { getImageUrl } from "../../utils/image";

function RestaurantProfile() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState({
    name: "",
    address: "",
    phone: "",
    cuisine: "",
    price_for_two: 400,
    delivery_time: "20-25 min",
    offer_text: "",
    opening_time: "09:00",
    closing_time: "22:00",
    description: "",
    image: null,
    pan_number: "",
    dftqc_license: "",
    vat_number: "",
    kyc_document: null,
    is_approved: 1,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [kycFile, setKycFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await api.get("/restaurants/my");
      const data = res.data;
      setProfile({
        name: data.name || "",
        address: data.address || "",
        phone: data.phone || "",
        cuisine: data.cuisine || data.cuisines || "",
        price_for_two: data.price_for_two || 400,
        delivery_time: data.delivery_time || "20-25 min",
        offer_text: data.offer_text || "",
        opening_time: data.opening_time || "09:00",
        closing_time: data.closing_time || "22:00",
        description: data.description || "",
        image: data.image || null,
        pan_number: data.pan_number || "",
        dftqc_license: data.dftqc_license || "",
        vat_number: data.vat_number || "",
        kyc_document: data.kyc_document || null,
        is_approved: data.is_approved ?? 1,
      });

      if (data.image) {
        setImagePreview(getImageUrl(data.image));
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function handleKycFileChange(e) {
    const file = e.target.files[0];
    if (file) setKycFile(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", profile.name || "");
      formData.append("address", profile.address || "");
      formData.append("phone", profile.phone || "");
      formData.append("cuisine", profile.cuisine || "");
      formData.append("cuisines", profile.cuisine || "");
      formData.append("price_for_two", Number(profile.price_for_two) || 400);
      formData.append("delivery_time", profile.delivery_time || "20-25 min");
      formData.append("offer_text", profile.offer_text || "");
      formData.append("opening_time", profile.opening_time || "09:00");
      formData.append("closing_time", profile.closing_time || "22:00");
      formData.append("description", profile.description || "");
      formData.append("pan_number", profile.pan_number || "");
      formData.append("dftqc_license", profile.dftqc_license || "");
      formData.append("vat_number", profile.vat_number || "");

      if (imageFile) formData.append("image", imageFile);
      if (kycFile) formData.append("kyc_document", kycFile);

      await api.put("/restaurants/my", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showToast("Profile & KYC documents saved successfully!", "success");
      loadProfile();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Loading profile..." />;

  const isApproved = profile.is_approved === 1;

  return (
    <div>
      <RestaurantNavbar />
      <div style={{ maxWidth: "700px", margin: "30px auto", padding: "0 20px" }}>
        <div className="card-box" style={{ padding: "24px" }}>
          
          {/* Header & Verification Status Badge */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: "900", color: "#0f172a", margin: 0 }}>
                🏪 Restaurant Profile & Home Page Listing
              </h2>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
                Edit business profile, offer tags, delivery details & legal KYC documents.
              </p>
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: "900",
                padding: "4px 12px",
                borderRadius: "12px",
                background: isApproved ? "#dcfce7" : "#fef9c3",
                color: isApproved ? "#15803d" : "#a16207",
                border: `1px solid ${isApproved ? "#86efac" : "#fde047"}`,
              }}
            >
              {isApproved ? "VERIFIED & APPROVED ✓" : "PENDING ADMIN REVIEW ⏳"}
            </span>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Photo / Logo Upload Box */}
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "8px", textAlign: "left" }}>
                Restaurant Photo / Logo Banner (Shown on Home Page)
              </label>

              <div
                style={{
                  width: "100%",
                  height: "200px",
                  borderRadius: "12px",
                  border: "2px dashed #cbd5e1",
                  background: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  marginBottom: "10px",
                  position: "relative",
                }}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Restaurant Banner" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ color: "#94a3b8", fontSize: "14px" }}>
                    <span style={{ fontSize: "36px", display: "block", marginBottom: "4px" }}>📸</span>
                    No photo uploaded yet
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="rest-image-input"
              />
              <label htmlFor="rest-image-input" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "inline-block" }}>
                📁 Upload / Change Restaurant Photo
              </label>
            </div>

            {/* Business Info */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>Restaurant Name *</label>
              <input
                type="text"
                className="auth-input"
                value={profile.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                required
              />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>Address / Location *</label>
              <input
                type="text"
                className="auth-input"
                value={profile.address || ""}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                required
              />
            </div>

            <div className="auth-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>Contact Phone</label>
                <input
                  type="text"
                  className="auth-input"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>Cuisine Types (Shown on Home)</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Nepali, Momos, Fast Food"
                  value={profile.cuisine || ""}
                  onChange={(e) => setProfile({ ...profile, cuisine: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>
            </div>

            {/* Home Page Display Info Section */}
            <div style={{ background: "#eff6ff", padding: "16px", borderRadius: "10px", border: "1px solid #bfdbfe", marginBottom: "16px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#1e40af", margin: "0 0 12px 0" }}>
                🏷️ Home Page Customer Card Details
              </h4>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Est. Delivery Time</label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="e.g. 20-25 min"
                    value={profile.delivery_time || "20-25 min"}
                    onChange={(e) => setProfile({ ...profile, delivery_time: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Avg. Price for Two (Rs.)</label>
                  <input
                    type="number"
                    className="auth-input"
                    placeholder="e.g. 400"
                    value={profile.price_for_two || 400}
                    onChange={(e) => setProfile({ ...profile, price_for_two: e.target.value })}
                    style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Special Offer Tag Text</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. 20% OFF up to Rs. 100"
                  value={profile.offer_text || ""}
                  onChange={(e) => setProfile({ ...profile, offer_text: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>Opening Time</label>
                <input
                  type="time"
                  className="auth-input"
                  value={profile.opening_time || "09:00"}
                  onChange={(e) => setProfile({ ...profile, opening_time: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>Closing Time</label>
                <input
                  type="time"
                  className="auth-input"
                  value={profile.closing_time || "22:00"}
                  onChange={(e) => setProfile({ ...profile, closing_time: e.target.value })}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>
            </div>

            {/* KYC Section */}
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#0f172a", margin: "0 0 12px 0" }}>
                📜 Legal & KYC Verification Documents (Nepal IRD & DFTQC)
              </h3>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>PAN Number (IRD Nepal)</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. PAN-601234567"
                  value={profile.pan_number || ""}
                  onChange={(e) => setProfile({ ...profile, pan_number: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>DFTQC Food Quality License</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. DFTQC-KTM-99482103"
                  value={profile.dftqc_license || ""}
                  onChange={(e) => setProfile({ ...profile, dftqc_license: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>VAT Registration Number</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. VAT-601234567"
                  value={profile.vat_number || ""}
                  onChange={(e) => setProfile({ ...profile, vat_number: e.target.value })}
                  style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
                  Upload KYC Document File (Certificate / License PDF or Photo)
                </label>
                <input type="file" accept="image/*,.pdf" onChange={handleKycFileChange} style={{ fontSize: "12px" }} />
                {profile.kyc_document && (
                  <div style={{ marginTop: "4px", fontSize: "12px", color: "#16a34a", fontWeight: "700" }}>
                    ✓ Current File: <a href={IMG_BASE + profile.kyc_document} target="_blank" rel="noreferrer" style={{ color: "#2563eb" }}>View Document</a>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "13px", fontWeight: "700", color: "#334155" }}>About / Description</label>
              <textarea
                className="auth-input"
                rows={3}
                value={profile.description || ""}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <button type="submit" disabled={saving} className="btn-primary" style={{ width: "100%", padding: "12px", fontSize: "14px", fontWeight: "800" }}>
              {saving ? "Saving Changes..." : "Save Profile & Home Page Details"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RestaurantProfile;
