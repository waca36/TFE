import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { adminGetPendingReservations, adminApproveReservation } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AdminPendingReservationsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }
    loadReservations();
  }, [user, token, navigate]);

  const loadReservations = async () => {
    try {
      const data = await adminGetPendingReservations(token);
      setReservations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setProcessing(id);
    setError("");
    try {
      await adminApproveReservation(id, true, null, token);
      setReservations((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError(t('admin.rejectionReasonRequired'));
      return;
    }

    setProcessing(showRejectModal);
    setError("");
    try {
      await adminApproveReservation(showRejectModal, false, rejectionReason, token);
      setReservations((prev) => prev.filter((r) => r.id !== showRejectModal));
      setShowRejectModal(null);
      setRejectionReason("");
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString("fr-BE", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  if (!user || user.role !== "ADMIN") return null;
  if (loading) return <p>{t('common.loading')}</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{t('admin.pendingReservations')}</h1>

      <p><Link to="/admin">← {t('admin.backToDashboard')}</Link></p>

      {error && <p style={styles.error}>{error}</p>}

      {reservations.length === 0 ? (
        <div style={styles.emptyState}>
          <p>{t('admin.noPendingReservations')}</p>
        </div>
      ) : (
        <div style={styles.list}>
          {reservations.map((r) => (
            <div key={r.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.espaceName}>{r.espace?.name}</h3>
                <span style={styles.badge}>{t('status.pending_approval')}</span>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.infoRow}>
                  <strong>{t('common.user')} :</strong>
                  <span>{r.user?.firstName} {r.user?.lastName} ({r.user?.email})</span>
                </div>
                <div style={styles.infoRow}>
                  <strong>{t('common.date')} :</strong>
                  <span>{formatDateTime(r.startDateTime)} - {formatDateTime(r.endDateTime)}</span>
                </div>
                <div style={styles.infoRow}>
                  <strong>{t('common.price')} :</strong>
                  <span>{r.totalPrice?.toFixed(2)} €</span>
                </div>
                <div style={styles.infoRow}>
                  <strong>{t('reservation.createdAt')} :</strong>
                  <span>{formatDateTime(r.createdAt)}</span>
                </div>

                <div style={styles.justificationBox}>
                  <strong>{t('reservation.justification')} :</strong>
                  <p style={styles.justificationText}>{r.justification}</p>
                </div>
              </div>

              <div style={styles.cardActions}>
                <button
                  onClick={() => handleApprove(r.id)}
                  disabled={processing === r.id}
                  style={styles.approveButton}
                >
                  {processing === r.id ? t('common.loading') : t('admin.approve')}
                </button>
                <button
                  onClick={() => setShowRejectModal(r.id)}
                  disabled={processing === r.id}
                  style={styles.rejectButton}
                >
                  {t('admin.reject')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showRejectModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>{t('admin.rejectReservation')}</h3>
            <p style={styles.modalText}>{t('admin.rejectReservationMessage')}</p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t('admin.rejectionReasonPlaceholder')}
              style={styles.textarea}
              rows={4}
            />

            <div style={styles.modalActions}>
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectionReason("");
                }}
                style={styles.cancelButton}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleReject}
                disabled={processing}
                style={styles.confirmRejectButton}
              >
                {processing ? t('common.loading') : t('admin.confirmReject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  title: {
    fontSize: "1.8rem",
    marginBottom: "1rem",
    color: "#1f2937",
  },
  error: {
    color: "#dc2626",
    background: "#fef2f2",
    padding: "0.75rem",
    borderRadius: "6px",
    marginBottom: "1rem",
  },
  emptyState: {
    background: "#fff",
    borderRadius: "8px",
    padding: "2rem",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    color: "#6b7280",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginTop: "1rem",
  },
  card: {
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    border: "2px solid #f59e0b",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    background: "#fffbeb",
    borderBottom: "1px solid #fde68a",
  },
  espaceName: {
    margin: 0,
    fontSize: "1.1rem",
    color: "#1f2937",
  },
  badge: {
    background: "#f59e0b",
    color: "#fff",
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  cardBody: {
    padding: "1rem",
  },
  infoRow: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "0.5rem",
    color: "#4b5563",
  },
  justificationBox: {
    marginTop: "1rem",
    padding: "1rem",
    background: "#f9fafb",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
  },
  justificationText: {
    margin: "0.5rem 0 0 0",
    color: "#374151",
    whiteSpace: "pre-wrap",
  },
  cardActions: {
    display: "flex",
    gap: "1rem",
    padding: "1rem",
    borderTop: "1px solid #e5e7eb",
    background: "#f9fafb",
  },
  approveButton: {
    flex: 1,
    padding: "0.75rem 1rem",
    border: "none",
    borderRadius: "6px",
    background: "#10b981",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
  },
  rejectButton: {
    flex: 1,
    padding: "0.75rem 1rem",
    border: "none",
    borderRadius: "6px",
    background: "#ef4444",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    borderRadius: "8px",
    padding: "1.5rem",
    maxWidth: "500px",
    width: "90%",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  modalTitle: {
    margin: "0 0 1rem 0",
    color: "#1f2937",
  },
  modalText: {
    color: "#6b7280",
    marginBottom: "1rem",
  },
  textarea: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "1rem",
    boxSizing: "border-box",
    resize: "vertical",
  },
  modalActions: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
  },
  cancelButton: {
    flex: 1,
    padding: "0.75rem 1rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    background: "#fff",
    color: "#374151",
    fontSize: "1rem",
    cursor: "pointer",
  },
  confirmRejectButton: {
    flex: 1,
    padding: "0.75rem 1rem",
    border: "none",
    borderRadius: "6px",
    background: "#ef4444",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
  },
};
