import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminGetPendingEvents, adminApproveEvent } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import styles from "./AdminPendingEventsPage.module.css";

export default function AdminPendingEventsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const getDateLocale = () => {
    const locales = { fr: "fr-BE", nl: "nl-BE", en: "en-GB" };
    return locales[i18n.language] || "fr-BE";
  };

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
  if (loading) return <p className={styles.info}>{t("common.loading")}</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t("admin.pendingEvents")}</h1>

      <p className={styles.linkRow}>
        <Link to="/admin" className={styles.linkGhost}>
          ← {t("admin.backToDashboard")}
        </Link>
      </p>

      {events.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{t("admin.noPendingEvents")}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {events.map((e) => (
            <div key={e.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{e.title}</h3>
                <span className={styles.pendingBadge}>{t("status.pending_approval")}</span>
              </div>

              <div className={styles.cardBody}>
                <p>
                  <strong>{t("organizer.createdBy")}:</strong> {e.createdByName}
                </p>
                <p>
                  <strong>{t("common.date")}:</strong> {new Date(e.startDateTime).toLocaleString(getDateLocale())}
                </p>
                <p>
                  <strong>{t("events.location")}:</strong> {e.location || "-"}
                </p>
                <p>
                  <strong>{t("common.capacity")}:</strong> {e.capacity} {t("common.persons")}
                </p>
                <p>
                  <strong>{t("common.price")}:</strong> {e.price > 0 ? `${e.price} €` : t("events.free")}
                </p>

                {e.description && (
                  <div className={styles.description}>
                    <strong>{t("common.description")}:</strong>
                    <p>{e.description}</p>
                  </div>
                )}
              </div>

              <div className={styles.cardActions}>
                {rejectingId === e.id ? (
                  <div className={styles.rejectForm}>
                    <textarea
                      placeholder={t("admin.rejectionReasonPlaceholder")}
                      value={rejectionReason}
                      onChange={(ev) => setRejectionReason(ev.target.value)}
                      className={styles.textarea}
                    />
                    <div className={styles.rejectActions}>
                      <button onClick={() => setRejectingId(null)} className={styles.cancelBtn}>
                        {t("common.cancel")}
                      </button>
                      <button onClick={() => handleReject(e.id)} className={styles.rejectBtn}>
                        {t("admin.confirmReject")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button onClick={() => handleApprove(e.id)} className={styles.approveBtn}>
                      {t("admin.approve")}
                    </button>
                    <button onClick={() => setRejectingId(e.id)} className={styles.rejectBtn}>
                      {t("admin.reject")}
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
