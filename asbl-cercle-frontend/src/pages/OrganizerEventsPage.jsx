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
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    if (!user || (user.role !== "ORGANIZER" && user.role !== "ADMIN")) {
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

  const handleCancel = async (id, title) => {
    if (!window.confirm(t("organizer.confirmCancelEvent", { title }))) return;

    try {
      await organizerCancelMyEvent(id, token);
      fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING_APPROVAL: { bg: "#fef3c7", color: "#92400e", icon: "⏳" },
      PUBLISHED: { bg: "#d1fae5", color: "#065f46", icon: "✓" },
      REJECTED: { bg: "#fee2e2", color: "#991b1b", icon: "✗" },
      CANCELLED: { bg: "#f3f4f6", color: "#6b7280", icon: "⊘" },
    };
    const style = styles[status] || styles.CANCELLED;
    return (
      <span style={{ 
        padding: "0.35rem 0.75rem", 
        borderRadius: "20px", 
        fontSize: "0.8rem",
        fontWeight: "500",
        background: style.bg, 
        color: style.color,
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem"
      }}>
        {style.icon} {t(`status.${status.toLowerCase()}`)}
      </span>
    );
  };

  const filteredEvents = filter === "ALL" 
    ? events 
    : events.filter(e => e.status === filter);

  const stats = {
    total: events.length,
    pending: events.filter(e => e.status === "PENDING_APPROVAL").length,
    published: events.filter(e => e.status === "PUBLISHED").length,
    rejected: events.filter(e => e.status === "REJECTED").length,
    cancelled: events.filter(e => e.status === "CANCELLED").length,
  };

  if (!user || (user.role !== "ORGANIZER" && user.role !== "ADMIN")) return null;
  if (loading) return <div style={styles.loading}>{t("common.loading")}</div>;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{t("organizer.myEvents")}</h1>
          <p style={styles.subtitle}>{t("organizer.manageYourEvents")}</p>
        </div>
        <Link to="/organizer/events/new" style={styles.createButton}>
          + {t("organizer.createEvent")}
        </Link>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard} onClick={() => setFilter("ALL")}>
          <span style={styles.statNumber}>{stats.total}</span>
          <span style={styles.statLabel}>{t("organizer.totalEvents")}</span>
        </div>
        <div style={{...styles.statCard, borderLeft: "4px solid #f59e0b"}} onClick={() => setFilter("PENDING_APPROVAL")}>
          <span style={styles.statNumber}>{stats.pending}</span>
          <span style={styles.statLabel}>{t("organizer.pendingApproval")}</span>
        </div>
        <div style={{...styles.statCard, borderLeft: "4px solid #10b981"}} onClick={() => setFilter("PUBLISHED")}>
          <span style={styles.statNumber}>{stats.published}</span>
          <span style={styles.statLabel}>{t("organizer.publishedEvents")}</span>
        </div>
        <div style={{...styles.statCard, borderLeft: "4px solid #ef4444"}} onClick={() => setFilter("REJECTED")}>
          <span style={styles.statNumber}>{stats.rejected}</span>
          <span style={styles.statLabel}>{t("organizer.rejectedEvents")}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={styles.filterTabs}>
        {["ALL", "PENDING_APPROVAL", "PUBLISHED", "REJECTED", "CANCELLED"].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              ...styles.filterTab,
              ...(filter === status ? styles.filterTabActive : {})
            }}
          >
            {status === "ALL" ? t("common.all") : t(`status.${status.toLowerCase()}`)}
            <span style={styles.filterCount}>
              {status === "ALL" ? stats.total : stats[status.toLowerCase().replace("_approval", "")] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📅</div>
          <h3>{t("organizer.noEvents")}</h3>
          <p>{t("organizer.createFirstEvent")}</p>
          <Link to="/organizer/events/new" style={styles.createButtonSmall}>
            {t("organizer.createEvent")}
          </Link>
        </div>
      ) : (
        <div style={styles.eventsGrid}>
          {filteredEvents.map((event) => (
            <div key={event.id} style={styles.eventCard}>
              <div style={styles.eventHeader}>
                <h3 style={styles.eventTitle}>{event.title}</h3>
                {getStatusBadge(event.status)}
              </div>

              {event.status === "REJECTED" && event.rejectionReason && (
                <div style={styles.rejectionBox}>
                  <strong>⚠️ {t("organizer.rejectionReason")}:</strong>
                  <p>{event.rejectionReason}</p>
                </div>
              )}

              <div style={styles.eventDetails}>
                <div style={styles.eventDetail}>
                  <span style={styles.detailIcon}>📅</span>
                  <span>{new Date(event.startDateTime).toLocaleDateString("fr-BE", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}</span>
                </div>
                <div style={styles.eventDetail}>
                  <span style={styles.detailIcon}>⏰</span>
                  <span>
                    {new Date(event.startDateTime).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
                    {" - "}
                    {new Date(event.endDateTime).toLocaleTimeString("fr-BE", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {event.location && (
                  <div style={styles.eventDetail}>
                    <span style={styles.detailIcon}>📍</span>
                    <span>{event.location}</span>
                  </div>
                )}
                <div style={styles.eventDetail}>
                  <span style={styles.detailIcon}>👥</span>
                  <span>{event.registeredCount || 0} / {event.capacity} {t("common.participants")}</span>
                </div>
                <div style={styles.eventDetail}>
                  <span style={styles.detailIcon}>💰</span>
                  <span>{event.price > 0 ? `${event.price.toFixed(2)} €` : t("events.free")}</span>
                </div>
              </div>

              <div style={styles.eventActions}>
                {(event.status === "PENDING_APPROVAL" || event.status === "REJECTED") && (
                  <Link to={`/organizer/events/edit/${event.id}`} style={styles.editButton}>
                    ✏️ {t("common.edit")}
                  </Link>
                )}
                {event.status !== "CANCELLED" && (
                  <button 
                    onClick={() => handleCancel(event.id, event.title)} 
                    style={styles.cancelButton}
                  >
                    🗑️ {t("common.cancel")}
                  </button>
                )}
                {event.status === "PUBLISHED" && (
                  <Link to={`/events`} style={styles.viewButton}>
                    👁️ {t("common.view")}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div style={styles.legend}>
        <h4 style={styles.legendTitle}>{t("organizer.statusLegend")}</h4>
        <div style={styles.legendGrid}>
          <div style={styles.legendItem}>
            {getStatusBadge("PENDING_APPROVAL")}
            <span>{t("organizer.pendingDesc")}</span>
          </div>
          <div style={styles.legendItem}>
            {getStatusBadge("PUBLISHED")}
            <span>{t("organizer.publishedDesc")}</span>
          </div>
          <div style={styles.legendItem}>
            {getStatusBadge("REJECTED")}
            <span>{t("organizer.rejectedDesc")}</span>
          </div>
          <div style={styles.legendItem}>
            {getStatusBadge("CANCELLED")}
            <span>{t("organizer.cancelledDesc")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "1rem",
  },
  loading: {
    textAlign: "center",
    padding: "3rem",
    color: "#6b7280",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  title: {
    margin: 0,
    fontSize: "1.75rem",
    color: "#111827",
  },
  subtitle: {
    margin: "0.25rem 0 0 0",
    color: "#6b7280",
  },
  createButton: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.75rem 1.5rem",
    background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "10px",
    fontWeight: "600",
    boxShadow: "0 4px 6px rgba(139, 92, 246, 0.25)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  error: {
    padding: "1rem",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "8px",
    marginBottom: "1rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  statCard: {
    background: "#fff",
    padding: "1.25rem",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    borderLeft: "4px solid #6366f1",
  },
  statNumber: {
    display: "block",
    fontSize: "2rem",
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: "0.85rem",
    color: "#6b7280",
  },
  filterTabs: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    background: "#f3f4f6",
    padding: "0.5rem",
    borderRadius: "12px",
  },
  filterTab: {
    padding: "0.5rem 1rem",
    border: "none",
    background: "transparent",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.2s",
  },
  filterTabActive: {
    background: "#fff",
    color: "#111827",
    fontWeight: "600",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  filterCount: {
    background: "#e5e7eb",
    padding: "0.15rem 0.5rem",
    borderRadius: "10px",
    fontSize: "0.75rem",
  },
  emptyState: {
    textAlign: "center",
    padding: "4rem 2rem",
    background: "#f9fafb",
    borderRadius: "16px",
    border: "2px dashed #e5e7eb",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },
  createButtonSmall: {
    display: "inline-block",
    marginTop: "1rem",
    padding: "0.75rem 1.5rem",
    background: "#6366f1",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "8px",
    fontWeight: "500",
  },
  eventsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "1.5rem",
  },
  eventCard: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  eventHeader: {
    padding: "1.25rem",
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
  },
  eventTitle: {
    margin: 0,
    fontSize: "1.1rem",
    color: "#111827",
    flex: 1,
  },
  rejectionBox: {
    margin: "0 1.25rem",
    padding: "0.75rem",
    background: "#fef2f2",
    borderRadius: "8px",
    borderLeft: "3px solid #ef4444",
    fontSize: "0.85rem",
    color: "#991b1b",
  },
  eventDetails: {
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  eventDetail: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontSize: "0.9rem",
    color: "#4b5563",
  },
  detailIcon: {
    fontSize: "1rem",
    width: "24px",
    textAlign: "center",
  },
  eventActions: {
    padding: "1rem 1.25rem",
    borderTop: "1px solid #f3f4f6",
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap",
  },
  editButton: {
    padding: "0.5rem 1rem",
    background: "#f3f4f6",
    color: "#374151",
    textDecoration: "none",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: "500",
    transition: "background 0.2s",
  },
  cancelButton: {
    padding: "0.5rem 1rem",
    background: "#fef2f2",
    color: "#dc2626",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  viewButton: {
    padding: "0.5rem 1rem",
    background: "#eff6ff",
    color: "#2563eb",
    textDecoration: "none",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: "500",
  },
  legend: {
    marginTop: "2rem",
    padding: "1.5rem",
    background: "#f9fafb",
    borderRadius: "12px",
  },
  legendTitle: {
    margin: "0 0 1rem 0",
    fontSize: "1rem",
    color: "#374151",
  },
  legendGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1rem",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontSize: "0.85rem",
    color: "#6b7280",
  },
};
