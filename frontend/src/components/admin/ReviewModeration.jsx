import React, { useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import ActionReasonModal from "./ActionReasonModal";

function ReviewModeration() {
  const { flaggedReviews, moderateReview } = useAdmin();
  const [activeReviewId, setActiveReviewId] = useState(null);
  const [decisionType, setDecisionType] = useState("Remove Review");

  const pendingModeration = flaggedReviews.filter((r) => r.status === "Pending Moderation");
  const processedModeration = flaggedReviews.filter((r) => r.status !== "Pending Moderation");

  const handleConfirmModeration = (reason) => {
    if (activeReviewId) {
      moderateReview(activeReviewId, decisionType, reason);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px 0" }}>
          ⭐ Review Moderation Queue
        </h2>
        <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
          Review customer feedback flagged by restaurant partners for spam, abuse, or policy violations.
        </p>
      </div>

      {/* Pending Queue */}
      <div className="ap-table-card" style={{ padding: "20px", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a", marginBottom: "12px" }}>
          ⚡ Flagged Reviews Pending Decision ({pendingModeration.length})
        </h3>

        {pendingModeration.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
            No flagged reviews currently in moderation queue.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {pendingModeration.map((rev) => (
              <div key={rev.id} style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "12px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                  <strong>Flagged by {rev.flaggedBy}</strong>
                  <span style={{ color: "#dc2626", fontWeight: "800" }}>{rev.rating} ⭐ Review</span>
                </div>

                <div style={{ fontSize: "13px", color: "#334155", background: "#ffffff", padding: "10px", borderRadius: "8px", margin: "8px 0" }}>
                  "{rev.reviewText}"
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => {
                      setActiveReviewId(rev.id);
                      setDecisionType("Keep Review");
                    }}
                    style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                  >
                    Keep Review (Dismiss Flag)
                  </button>

                  <button
                    onClick={() => {
                      setActiveReviewId(rev.id);
                      setDecisionType("Remove Review");
                    }}
                    style={{ background: "#dc2626", color: "#ffffff", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                  >
                    Remove Review
                  </button>

                  <button
                    onClick={() => {
                      setActiveReviewId(rev.id);
                      setDecisionType("Warn Customer");
                    }}
                    style={{ background: "#ea580c", color: "#ffffff", border: "none", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                  >
                    Warn Customer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Reason Modal */}
      <ActionReasonModal
        isOpen={Boolean(activeReviewId)}
        title={`Confirm Decision: ${decisionType}`}
        promptText="Specify moderation reason for audit log entry."
        actionButtonText="Submit Decision"
        onConfirm={handleConfirmModeration}
        onClose={() => setActiveReviewId(null)}
      />
    </div>
  );
}

export default ReviewModeration;
