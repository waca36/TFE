import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { adminGetPendingReservations, adminApproveReservation } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./AdminPendingReservationsPage.module.css";

export default function AdminPendingReservationsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const getDateLocale = () => {
    const locales = { fr: "fr-BE", nl: "nl-BE", en: "en-GB" };
    return locales[i18n.language] || "fr-BE";
  };

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
    return date.toLocaleString(getDateLocale(), {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  if (!user || user.role !== "ADMIN") return null;
  if (loading) return <p className={styles.info}>{t('common.loading')}</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t('admin.pendingReservations')}</h1>

      <p><Link to="/admin">← {t('admin.backToDashboard')}</Link></p>

      {error && <p className={styles.error}>{error}</p>}

      {reservations.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{t('admin.noPendingReservations')}</p>
        </div>
      ) : (
        <div className={styles.list}>
          {reservations.map((r) => (
            <div key={r.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.espaceName}>{r.espace?.name}</h3>
                <span className={styles.badge}>{t('status.pending_approval')}</span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.infoRow}>
                  <strong>{t('common.user')} :</strong>
                  <span>{r.user?.firstName} {r.user?.lastName} ({r.user?.email})</span>
                </div>
                <div className={styles.infoRow}>
                  <strong>{t('common.date')} :</strong>
                  <span>{formatDateTime(r.startDateTime)} - {formatDateTime(r.endDateTime)}</span>
                </div>
                <div className={styles.infoRow}>
                  <strong>{t('common.price')} :</strong>
                  <span>{r.totalPrice?.toFixed(2)} €</span>
                </div>
                <div className={styles.infoRow}>
                  <strong>{t('reservation.createdAt')} :</strong>
                  <span>{formatDateTime(r.createdAt)}</span>
                </div>

                <div className={styles.justificationBox}>
                  <strong>{t('reservation.justification')} :</strong>
                  <p className={styles.justificationText}>{r.justification}</p>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  onClick={() => handleApprove(r.id)}
                  disabled={processing === r.id}
                  className={styles.approveButton}
                >
                  {processing === r.id ? t('common.loading') : t('admin.approve')}
                </button>
                <button
                  onClick={() => setShowRejectModal(r.id)}
                  disabled={processing === r.id}
                  className={styles.rejectButton}
                >
                  {t('admin.reject')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showRejectModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>{t('admin.rejectReservation')}</h3>
            <p className={styles.modalText}>{t('admin.rejectReservationMessage')}</p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t('admin.rejectionReasonPlaceholder')}
              className={styles.textarea}
              rows={4}
            />

            <div className={styles.modalActions}>
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectionReason("");
                }}
                className={styles.cancelButton}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleReject}
                disabled={processing}
                className={styles.confirmRejectButton}
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
