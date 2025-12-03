import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminGetPendingEvents, adminApproveEvent } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function AdminPendingEventsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }

    fetchEvents();
  }, [user, token, navigate]);

  const fetchEvents = () => {
    setLoading(true);
    adminGetPendingEvents(token)
      .then(setEvents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const handleApprove = async (id) => {
    if (!window.confirm(t("admin.confirmApprove"))) return;

    try {
      await adminApproveEvent(id, true, null, token);
      fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
      alert(t("admin.rejectionReasonRequired"));
      return;
    }

    try {
      await adminApproveEvent(id, false, rejectionReason, token);
      setRejectingId(null);
      setRejectionReason("");
      fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user || user.role !== "ADMIN") return null;
  if (loading) return <p>{t("common.loading")}</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>{t("admin.pendingEvents")}</h1>

      <p>
        <Link to="/admin">← {t("admin.backToDashboard")}</Link>
      </p>

      {events.length === 0 ? (
        <div style={styles.emptyState}>
          <p>✅ {t("admin.noPendingEvents")}</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {events.map((e) => (
            <div key={e.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{e.title}</h3>
                <span style={styles.pendingBadge}>{t("status.pending_approval")}</span>
              </div>

              <div style={styles.cardBody}>
                <p><strong>{t("organizer.createdBy")}:</strong> {e.createdByName}</p>
                <p><strong>{t("common.date")}:</strong> {new Date(e.startDateTime).toLocaleString("fr-BE")}</p>
                <p><strong>{t("events.location")}:</strong> {e.location || "-"}</p>
                <p><strong>{t("common.capacity")}:</strong> {e.capacity} {t("common.persons")}</p>
                <p><strong>{t("common.price")}:</strong> {e.price > 0 ? `${e.price} €` : t("events.free")}</p>
                
                {e.description && (
                  <div style={styles.description}>
                    <strong>{t("common.description")}:</strong>
                    <p>{e.description}</p>
                  </div>
                )}
              </div>

              <div style={styles.cardActions}>
                {rejectingId === e.id ? (
                  <div style={styles.rejectForm}>
                    <textarea
                      placeholder={t("admin.rejectionReasonPlaceholder")}
                      value={rejectionReason}
                      onChange={(ev) => setRejectionReason(ev.target.value)}
                      style={styles.textarea}
                    />
                    <div style={styles.rejectActions}>
                      <button onClick={() => setRejectingId(null)} style={styles.cancelBtn}>
                        {t("common.cancel")}
                      </button>
                      <button onClick={() => handleReject(e.id)} style={styles.rejectBtn}>
                        {t("admin.confirmReject")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button onClick={() => handleApprove(e.id)} style={styles.approveBtn}>
                      ✓ {t("admin.approve")}
                    </button>
                    <button onClick={() => setRejectingId(e.id)} style={styles.rejectBtn}>
                      ✗ {t("admin.reject")}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    background: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  cardTitle: {
    margin: 0,
    fontSize: "1.1rem",
  },
  pendingBadge: {
    padding: "0.25rem 0.5rem",
    background: "#fef3c7",
    color: "#92400e",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "500",
  },
  cardBody: {
    padding: "1rem",
  },
  description: {
    marginTop: "1rem",
    padding: "0.75rem",
    background: "#f9fafb",
    borderRadius: "6px",
  },
  cardActions: {
    padding: "1rem",
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    gap: "0.5rem",
    justifyContent: "flex-end",
  },
  approveBtn: {
    padding: "0.5rem 1rem",
    background: "#059669",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  rejectBtn: {
    padding: "0.5rem 1rem",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
  },
  cancelBtn: {
    padding: "0.5rem 1rem",
    background: "#f3f4f6",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  rejectForm: {
    width: "100%",
  },
  textarea: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    marginBottom: "0.5rem",
    resize: "vertical",
  },
  rejectActions: {
    display: "flex",
    gap: "0.5rem",
    justifyContent: "flex-end",
  },
  emptyState: {
    padding: "3rem",
    textAlign: "center",
    background: "#d1fae5",
    borderRadius: "8px",
    color: "#065f46",
  },
};
