import React, { useState } from "react";

function ActionReasonModal({ isOpen, title, promptText, actionButtonText, onConfirm, onClose }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("A mandatory reason/note is required for this action to log to audit history.");
      return;
    }
    onConfirm(reason);
    setReason("");
    setError("");
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "480px",
          padding: "24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#dc2626", margin: "0 0 6px 0" }}>
          ⚠️ {title || "Confirm Administrative Action"}
        </h3>

        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px" }}>
          {promptText || "This high-impact action will be permanently logged in the platform Audit Trail."}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
              Mandatory Audit Reason / Note:
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              placeholder="e.g. Verified hygiene complaint #402 from customer..."
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                fontFamily: "inherit"
              }}
            />
          </div>

          {error && (
            <div style={{ color: "#dc2626", fontSize: "12px", fontWeight: "700", marginBottom: "12px" }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                padding: "10px",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                background: "#dc2626",
                color: "#ffffff",
                border: "none",
                padding: "10px",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              {actionButtonText || "Confirm & Log Action"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ActionReasonModal;
