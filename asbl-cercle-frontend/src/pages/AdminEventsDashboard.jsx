import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { adminGetEvents, adminGetPendingEvents, adminApproveEvent, adminDeleteEvent } from "../services/api";
import styles from "./AdminEventsDashboard.module.css";

export default function AdminEventsDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [events, setEvents] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }
    loadData();
  }, [user, token, navigate]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [allEvents, pendingEvents] = await Promise.all([
        adminGetEvents(token),
        adminGetPendingEvents(token),
      ]);
      setEvents(allEvents);
      setPending(pendingEvents);
    } catch (err) {
      setError(err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm(t("admin.confirmApprove"))) return;
    try {
      await adminApproveEvent(id, true, null, token);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt(t("admin.rejectionReasonRequired"));
    if (!reason) return;
    try {
      await adminApproveEvent(id, false, reason, token);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("admin.confirmDeleteEvent"))) return;
    try {
      await adminDeleteEvent(id, token);
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
      setPending((prev) => prev.filter((ev) => ev.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const statusClass = (status) => {
    if (status === "PUBLISHED") return `${styles.pill} ${styles.statusPublished}`;
    if (status === "CANCELLED") return `${styles.pill} ${styles.statusCancelled}`;
    return `${styles.pill} ${styles.statusDraft}`;
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <p className={styles.kicker}>Admin</p>
          <h1 className={styles.title}>{t("admin.eventsManagement")}</h1>
          <p className={styles.subtitle}>{t("admin.dashboardSubtitle")}</p>
        </div>
        <div className={styles.actions}>
          <Link to="/admin" className={styles.secondary}>
            ← {t("admin.backToDashboard")}
          </Link>
          <Link to="/admin/events/new" className={styles.primary}>
            + {t("admin.createEvent")}
          </Link>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {loading ? <p className={styles.info}>{t("common.loading")}</p> : null}

      {!loading && (
        <>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {t("admin.pendingEvents")}
              <span className={styles.badge}>{pending.length}</span>
            </h2>
            {pending.length === 0 ? (
              <p className={styles.info}>{t("admin.noPendingEvents")}</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t("common.title")}</th>
                      <th>{t("common.date")}</th>
                      <th>{t("common.status")}</th>
                      <th>{t("common.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((ev) => (
                      <tr key={ev.id}>
                        <td>{ev.title}</td>
                        <td>
                          {ev.startDateTime} → {ev.endDateTime}
                        </td>
                        <td>
                          <span className={statusClass(ev.status)}>{ev.status}</span>
                        </td>
                        <td>
                          <div className={styles.rowActions}>
                            <button className={styles.primary} onClick={() => handleApprove(ev.id)}>
                              {t("admin.approve")}
                            </button>
                            <button className={styles.secondary} onClick={() => handleReject(ev.id)}>
                              {t("admin.reject")}
                            </button>
                            <Link to={`/admin/events/${ev.id}/edit`} className={styles.link}>
                              {t("common.edit")}
                            </Link>
                            <button className={styles.secondary} onClick={() => handleDelete(ev.id)}>
                              {t("common.delete")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t("admin.eventsManagement")}</h2>
            {events.length === 0 ? (
              <p className={styles.info}>{t("admin.noEventsFound")}</p>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t("common.title")}</th>
                      <th>{t("common.date")}</th>
                      <th>{t("common.capacity")}</th>
                      <th>{t("common.price")}</th>
                      <th>{t("common.status")}</th>
                      <th>{t("common.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev) => (
                      <tr key={ev.id}>
                        <td>{ev.title}</td>
                        <td>
                          {ev.startDateTime} → {ev.endDateTime}
                        </td>
                        <td>{ev.capacity || "-"}</td>
                        <td>{ev.price ? `${ev.price} €` : t("events.free")}</td>
                        <td>
                          <span className={statusClass(ev.status)}>{ev.status}</span>
                        </td>
                        <td>
                          <div className={styles.rowActions}>
                            <Link to={`/admin/events/${ev.id}/edit`} className={styles.link}>
                              {t("common.edit")}
                            </Link>
                            <button className={styles.secondary} onClick={() => handleDelete(ev.id)}>
                              {t("common.delete")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
