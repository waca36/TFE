import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { organizerGetMyEvents, organizerCancelMyEvent } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function OrganizerEventsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || (user.role !== "ORGANISATEUR" && user.role !== "ADMIN")) {
      navigate("/login");
      return;
    }

    fetchEvents();
  }, [user, token, navigate]);

  const fetchEvents = () => {
    setLoading(true);
    organizerGetMyEvents(token)
      .then(setEvents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const handleCancel = async (id) => {
    if (!window.confirm(t("organizer.confirmCancel"))) return;

    try {
      await organizerCancelMyEvent(id, token);
      fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "PUBLISHED":
        return { background: "#d1fae5", color: "#065f46" };
      case "PENDING_APPROVAL":
        return { background: "#fef3c7", color: "#92400e" };
      case "REJECTED":
        return { background: "#fee2e2", color: "#991b1b" };
      case "CANCELLED":
        return { background: "#f3f4f6", color: "#6b7280" };
      default:
        return { background: "#f3f4f6", color: "#374151" };
    }
  };

  if (!user || (user.role !== "ORGANISATEUR" && user.role !== "ADMIN")) return null;
  if (loading) return <p>{t("common.loading")}</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>{t("organizer.myEvents")}</h1>

      <div style={styles.header}>
        <Link to="/organizer/events/new" style={styles.createButton}>
          + {t("organizer.createEvent")}
        </Link>
      </div>

      {events.length === 0 ? (
        <p>{t("organizer.noEvents")}</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>{t("common.title")}</th>
              <th style={styles.th}>{t("common.date")}</th>
              <th style={styles.th}>{t("events.participants")}</th>
              <th style={styles.th}>{t("common.price")}</th>
              <th style={styles.th}>{t("common.status")}</th>
              <th style={styles.th}>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td style={styles.td}>
                  <strong>{e.title}</strong>
                  {e.rejectionReason && (
                    <div style={styles.rejectionReason}>
                      <strong>{t("organizer.rejectionReason")}:</strong> {e.rejectionReason}
                    </div>
                  )}
                </td>
                <td style={styles.td}>
                  {new Date(e.startDateTime).toLocaleDateString("fr-BE")}{" "}
                  {new Date(e.startDateTime).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td style={styles.td}>
                  {e.registeredCount} / {e.capacity}
                </td>
                <td style={styles.td}>
                  {e.price > 0 ? `${e.price} €` : t("events.free")}
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.statusBadge, ...getStatusStyle(e.status) }}>
                    {t(`status.${e.status.toLowerCase()}`)}
                  </span>
                </td>
                <td style={styles.td}>
                  {(e.status === "PENDING_APPROVAL" || e.status === "REJECTED") && (
                    <>
                      <Link to={`/organizer/events/edit/${e.id}`} style={styles.link}>
                        {t("common.edit")}
                      </Link>
                      {" | "}
                    </>
                  )}
                  {e.status !== "CANCELLED" && (
                    <button onClick={() => handleCancel(e.id)} style={styles.cancelBtn}>
                      {t("common.cancel")}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={styles.legend}>
        <h3>{t("organizer.statusLegend")}</h3>
        <ul>
          <li><span style={{ ...styles.legendBadge, ...getStatusStyle("PENDING_APPROVAL") }}>{t("status.pending_approval")}</span> - {t("organizer.pendingDesc")}</li>
          <li><span style={{ ...styles.legendBadge, ...getStatusStyle("PUBLISHED") }}>{t("status.published")}</span> - {t("organizer.publishedDesc")}</li>
          <li><span style={{ ...styles.legendBadge, ...getStatusStyle("REJECTED") }}>{t("status.rejected")}</span> - {t("organizer.rejectedDesc")}</li>
          <li><span style={{ ...styles.legendBadge, ...getStatusStyle("CANCELLED") }}>{t("status.cancelled")}</span> - {t("organizer.cancelledDesc")}</li>
        </ul>
      </div>
    </div>
  );
}

const styles = {
  header: {
    marginBottom: "1.5rem",
  },
  createButton: {
    display: "inline-block",
    padding: "0.75rem 1.5rem",
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
    fontWeight: "500",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  th: {
    padding: "0.75rem 1rem",
    textAlign: "left",
    background: "#f9fafb",
    borderBottom: "2px solid #e5e7eb",
    fontWeight: "600",
    color: "#374151",
  },
  td: {
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #e5e7eb",
  },
  statusBadge: {
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
  cancelBtn: {
    background: "none",
    border: "none",
    color: "#dc2626",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  rejectionReason: {
    marginTop: "0.5rem",
    padding: "0.5rem",
    background: "#fee2e2",
    borderRadius: "4px",
    fontSize: "0.85rem",
    color: "#991b1b",
  },
  legend: {
    marginTop: "2rem",
    padding: "1rem",
    background: "#f9fafb",
    borderRadius: "8px",
  },
  legendBadge: {
    padding: "0.2rem 0.4rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "500",
  },
};
