import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  adminGetEspaces,
  adminDeleteEspace,
  adminGetEvents,
  adminGetGarderieSessions,
  adminGetStats,
  adminGetAllSpaceReservations,
  adminGetAllEventRegistrations,
  adminGetAllGarderieReservations,
  adminGetPendingEvents,
  adminGetPendingReservations,
  adminApproveEvent,
  adminDeleteEvent,
} from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState(null);
  const [espaces, setEspaces] = useState([]);
  const [events, setEvents] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [pendingReservations, setPendingReservations] = useState([]);
  const [garderieSessions, setGarderieSessions] = useState([]);
  const [spaceReservations, setSpaceReservations] = useState([]);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [garderieReservations, setGarderieReservations] = useState([]);

  // State pour le rejet d'événement
  const [rejectingEventId, setRejectingEventId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }
    loadData();
  }, [user, token, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        statsData,
        espacesData,
        eventsData,
        pendingData,
        pendingResData,
        garderieData,
        spaceResData,
        eventResData,
        garderieResData,
      ] = await Promise.all([
        adminGetStats(token),
        adminGetEspaces(token),
        adminGetEvents(token),
        adminGetPendingEvents(token),
        adminGetPendingReservations(token),
        adminGetGarderieSessions(token),
        adminGetAllSpaceReservations(token),
        adminGetAllEventRegistrations(token),
        adminGetAllGarderieReservations(token),
      ]);

      setStats(statsData);
      setEspaces(espacesData);
      setEvents(eventsData);
      setPendingEvents(pendingData);
      setPendingReservations(pendingResData);
      setGarderieSessions(garderieData);
      setSpaceReservations(spaceResData);
      setEventRegistrations(eventResData);
      setGarderieReservations(garderieResData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEspace = async (id) => {
    if (!window.confirm(t("admin.confirmDeleteSpace"))) return;
    try {
      await adminDeleteEspace(id, token);
      setEspaces((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm(t("admin.confirmDeleteEvent"))) return;
    try {
      await adminDeleteEvent(id, token);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setPendingEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApproveEvent = async (id) => {
    if (!window.confirm(t("admin.confirmApprove"))) return;
    try {
      await adminApproveEvent(id, true, null, token);
      loadData(); // Recharger les données
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRejectEvent = async (id) => {
    if (!rejectionReason.trim()) {
      alert(t("admin.rejectionReasonRequired"));
      return;
    }
    try {
      await adminApproveEvent(id, false, rejectionReason, token);
      setRejectingEventId(null);
      setRejectionReason("");
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user || user.role !== "ADMIN") return null;
  if (loading) return <div style={styles.loading}>{t("common.loading")}</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  const tabs = [
    { id: "overview", label: t("admin.overview"), icon: "📊" },
    { id: "pendingEvents", label: t("admin.pendingEvents"), icon: "⏳", badge: pendingEvents.length },
    { id: "spaces", label: t("admin.spacesManagement"), icon: "🏢" },
    { id: "events", label: t("admin.eventsManagement"), icon: "📅" },
    { id: "garderie", label: t("admin.childcareManagement"), icon: "👶" },
    { id: "spaceReservations", label: t("admin.spaceReservations"), icon: "📋" },
    { id: "eventReservations", label: t("admin.eventReservations"), icon: "🎟️" },
    { id: "garderieReservations", label: t("admin.garderieReservations"), icon: "📝" },
  ];

  const getStatusBadge = (status) => {
    const config = {
      PENDING_APPROVAL: { bg: "#fef3c7", color: "#92400e" },
      PUBLISHED: { bg: "#d1fae5", color: "#065f46" },
      REJECTED: { bg: "#fee2e2", color: "#991b1b" },
      CANCELLED: { bg: "#f3f4f6", color: "#6b7280" },
      CONFIRMED: { bg: "#d1fae5", color: "#065f46" },
      AVAILABLE: { bg: "#d1fae5", color: "#065f46" },
      UNAVAILABLE: { bg: "#fee2e2", color: "#991b1b" },
      OPEN: { bg: "#d1fae5", color: "#065f46" },
      CLOSED: { bg: "#f3f4f6", color: "#6b7280" },
    };
    const style = config[status] || { bg: "#f3f4f6", color: "#6b7280" };
    return (
      <span style={{ 
        padding: "0.25rem 0.6rem", 
        borderRadius: "12px", 
        fontSize: "0.75rem",
        fontWeight: "500",
        background: style.bg, 
        color: style.color 
      }}>
        {t(`status.${status.toLowerCase()}`)}
      </span>
    );
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{t("admin.dashboard")}</h1>

      {/* Alerte événements en attente */}
      {pendingEvents.length > 0 && activeTab !== "pendingEvents" && (
        <div style={styles.alertBox} onClick={() => setActiveTab("pendingEvents")}>
          <span style={styles.alertIcon}>⏳</span>
          <span>
            <strong>{pendingEvents.length}</strong> {t("admin.eventsPendingApproval")}
          </span>
          <span style={styles.alertAction}>{t("common.view")} →</span>
        </div>
      )}

      {/* Alerte réservations d'auditoire en attente */}
      {pendingReservations.length > 0 && (
        <Link to="/admin/reservations/pending" style={{ textDecoration: "none" }}>
          <div style={{...styles.alertBox, background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", marginBottom: "1rem"}}>
            <span style={styles.alertIcon}>🏛️</span>
            <span>
              <strong>{pendingReservations.length}</strong> {t("admin.auditoriumReservationsPending")}
            </span>
            <span style={styles.alertAction}>{t("common.view")} →</span>
          </div>
        </Link>
      )}

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {}),
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge > 0 && (
              <span style={styles.tabBadge}>{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <span style={styles.statIcon}>👥</span>
                <div>
                  <span style={styles.statNumber}>{stats?.totalUsers || 0}</span>
                  <span style={styles.statLabel}>{t("admin.totalUsers")}</span>
                </div>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statIcon}>🏢</span>
                <div>
                  <span style={styles.statNumber}>{stats?.totalEspaces || 0}</span>
                  <span style={styles.statLabel}>{t("admin.totalSpaces")}</span>
                </div>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statIcon}>📅</span>
                <div>
                  <span style={styles.statNumber}>{stats?.totalEvents || 0}</span>
                  <span style={styles.statLabel}>{t("admin.totalEvents")}</span>
                </div>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statIcon}>👶</span>
                <div>
                  <span style={styles.statNumber}>{stats?.totalGarderieSessions || 0}</span>
                  <span style={styles.statLabel}>{t("admin.totalSessions")}</span>
                </div>
              </div>
              <div style={{...styles.statCard, borderLeft: "4px solid #10b981"}}>
                <span style={styles.statIcon}>💰</span>
                <div>
                  <span style={styles.statNumber}>{(stats?.totalRevenue || 0).toFixed(2)} €</span>
                  <span style={styles.statLabel}>{t("admin.totalRevenue")}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <h3 style={styles.sectionTitle}>{t("admin.quickActions")}</h3>
            <div style={styles.quickActions}>
              <Link to="/admin/espaces/new" style={styles.quickAction}>
                🏢 {t("admin.addSpace")}
              </Link>
              <Link to="/admin/events/new" style={styles.quickAction}>
                📅 {t("admin.addEvent")}
              </Link>
              <Link to="/admin/garderie/new" style={styles.quickAction}>
                👶 {t("admin.addSession")}
              </Link>
              <Link to="/admin/reservations" style={styles.quickAction}>
                📋 {t("admin.viewAllReservations")}
              </Link>
              {pendingReservations.length > 0 && (
                <Link to="/admin/reservations/pending" style={{...styles.quickAction, background: "#fef3c7", color: "#92400e"}}>
                  🏛️ {t("admin.pendingReservations")} ({pendingReservations.length})
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Pending Events Tab */}
        {activeTab === "pendingEvents" && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>{t("admin.pendingEvents")}</h2>
              <span style={styles.countBadge}>{pendingEvents.length} {t("admin.pending")}</span>
            </div>

            {pendingEvents.length === 0 ? (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}>✅</span>
                <h3>{t("admin.noPendingEvents")}</h3>
                <p>{t("admin.allEventsReviewed")}</p>
              </div>
            ) : (
              <div style={styles.pendingGrid}>
                {pendingEvents.map((event) => (
                  <div key={event.id} style={styles.pendingCard}>
                    <div style={styles.pendingHeader}>
                      <h3 style={styles.pendingTitle}>{event.title}</h3>
                      {getStatusBadge("PENDING_APPROVAL")}
                    </div>

                    <div style={styles.pendingMeta}>
                      <p><strong>{t("organizer.createdBy")}:</strong> {event.createdByName || "N/A"}</p>
                      <p><strong>{t("common.date")}:</strong> {new Date(event.startDateTime).toLocaleString("fr-BE")}</p>
                      <p><strong>{t("events.location")}:</strong> {event.location || "-"}</p>
                      <p><strong>{t("common.capacity")}:</strong> {event.capacity} {t("common.persons")}</p>
                      <p><strong>{t("common.price")}:</strong> {event.price > 0 ? `${event.price.toFixed(2)} €` : t("events.free")}</p>
                    </div>

                    {event.description && (
                      <div style={styles.pendingDesc}>
                        <strong>{t("common.description")}:</strong>
                        <p>{event.description}</p>
                      </div>
                    )}

                    {rejectingEventId === event.id ? (
                      <div style={styles.rejectForm}>
                        <textarea
                          placeholder={t("admin.rejectionReasonPlaceholder")}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          style={styles.rejectTextarea}
                          rows={3}
                        />
                        <div style={styles.rejectActions}>
                          <button 
                            onClick={() => { setRejectingEventId(null); setRejectionReason(""); }}
                            style={styles.btnCancel}
                          >
                            {t("common.cancel")}
                          </button>
                          <button 
                            onClick={() => handleRejectEvent(event.id)}
                            style={styles.btnReject}
                          >
                            {t("admin.confirmReject")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={styles.pendingActions}>
                        <button onClick={() => handleApproveEvent(event.id)} style={styles.btnApprove}>
                          ✓ {t("admin.approve")}
                        </button>
                        <button onClick={() => setRejectingEventId(event.id)} style={styles.btnReject}>
                          ✗ {t("admin.reject")}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Spaces Tab */}
        {activeTab === "spaces" && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>{t("admin.spacesManagement")}</h2>
              <Link to="/admin/espaces/new" style={styles.addButton}>+ {t("admin.addSpace")}</Link>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>{t("common.name")}</th>
                  <th style={styles.th}>{t("common.capacity")}</th>
                  <th style={styles.th}>{t("common.pricePerHour")}</th>
                  <th style={styles.th}>{t("common.status")}</th>
                  <th style={styles.th}>{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {espaces.map((e) => (
                  <tr key={e.id}>
                    <td style={styles.td}>{e.name}</td>
                    <td style={styles.td}>{e.capacity}</td>
                    <td style={styles.td}>{e.pricePerHour} €</td>
                    <td style={styles.td}>{getStatusBadge(e.status)}</td>
                    <td style={styles.td}>
                      <Link to={`/admin/espaces/${e.id}/edit`} style={styles.linkBtn}>{t("common.edit")}</Link>
                      {" | "}
                      <button onClick={() => handleDeleteEspace(e.id)} style={styles.deleteBtn}>{t("common.delete")}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>{t("admin.eventsManagement")}</h2>
              <Link to="/admin/events/new" style={styles.addButton}>+ {t("admin.addEvent")}</Link>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>{t("common.title")}</th>
                  <th style={styles.th}>{t("common.date")}</th>
                  <th style={styles.th}>{t("events.participants")}</th>
                  <th style={styles.th}>{t("common.price")}</th>
                  <th style={styles.th}>{t("common.status")}</th>
                  <th style={styles.th}>{t("organizer.createdBy")}</th>
                  <th style={styles.th}>{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td style={styles.td}>{e.title}</td>
                    <td style={styles.td}>{new Date(e.startDateTime).toLocaleDateString("fr-BE")}</td>
                    <td style={styles.td}>{e.registeredCount || 0} / {e.capacity}</td>
                    <td style={styles.td}>{e.price > 0 ? `${e.price} €` : t("events.free")}</td>
                    <td style={styles.td}>{getStatusBadge(e.status)}</td>
                    <td style={styles.td}>{e.createdByName || "Admin"}</td>
                    <td style={styles.td}>
                      <Link to={`/admin/events/${e.id}/edit`} style={styles.linkBtn}>{t("common.edit")}</Link>
                      {" | "}
                      <button onClick={() => handleDeleteEvent(e.id)} style={styles.deleteBtn}>{t("common.delete")}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Garderie Tab */}
        {activeTab === "garderie" && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>{t("admin.childcareManagement")}</h2>
              <Link to="/admin/garderie/new" style={styles.addButton}>+ {t("admin.addSession")}</Link>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>{t("common.title")}</th>
                  <th style={styles.th}>{t("common.date")}</th>
                  <th style={styles.th}>{t("common.time")}</th>
                  <th style={styles.th}>{t("common.capacity")}</th>
                  <th style={styles.th}>{t("childcare.pricePerChild")}</th>
                  <th style={styles.th}>{t("common.status")}</th>
                  <th style={styles.th}>{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {garderieSessions.map((s) => (
                  <tr key={s.id}>
                    <td style={styles.td}>{s.title}</td>
                    <td style={styles.td}>{s.sessionDate}</td>
                    <td style={styles.td}>{s.startTime} - {s.endTime}</td>
                    <td style={styles.td}>{s.capacity}</td>
                    <td style={styles.td}>{s.pricePerChild} €</td>
                    <td style={styles.td}>{getStatusBadge(s.status)}</td>
                    <td style={styles.td}>
                      <Link to={`/admin/garderie/edit/${s.id}`} style={styles.linkBtn}>{t("common.edit")}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Space Reservations Tab */}
        {activeTab === "spaceReservations" && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>{t("admin.spaceReservations")}</h2>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>{t("common.user")}</th>
                  <th style={styles.th}>{t("spaces.space")}</th>
                  <th style={styles.th}>{t("common.date")}</th>
                  <th style={styles.th}>{t("common.price")}</th>
                  <th style={styles.th}>{t("common.status")}</th>
                </tr>
              </thead>
              <tbody>
                {spaceReservations.map((r) => (
                  <tr key={r.id}>
                    <td style={styles.td}>{r.userName}<br/><small style={{color:"#6b7280"}}>{r.userEmail}</small></td>
                    <td style={styles.td}>{r.espaceName}</td>
                    <td style={styles.td}>{new Date(r.startDateTime).toLocaleString("fr-BE")}</td>
                    <td style={styles.td}>{r.totalPrice?.toFixed(2)} €</td>
                    <td style={styles.td}>{getStatusBadge(r.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Event Registrations Tab */}
        {activeTab === "eventReservations" && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>{t("admin.eventReservations")}</h2>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>{t("common.user")}</th>
                  <th style={styles.th}>{t("events.event")}</th>
                  <th style={styles.th}>{t("events.participants")}</th>
                  <th style={styles.th}>{t("common.price")}</th>
                  <th style={styles.th}>{t("common.status")}</th>
                </tr>
              </thead>
              <tbody>
                {eventRegistrations.map((r) => (
                  <tr key={r.id}>
                    <td style={styles.td}>{r.userName}<br/><small style={{color:"#6b7280"}}>{r.userEmail}</small></td>
                    <td style={styles.td}>{r.eventTitle}</td>
                    <td style={styles.td}>{r.numberOfParticipants}</td>
                    <td style={styles.td}>{r.totalPrice?.toFixed(2)} €</td>
                    <td style={styles.td}>{getStatusBadge(r.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Garderie Reservations Tab */}
        {activeTab === "garderieReservations" && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>{t("admin.garderieReservations")}</h2>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>{t("common.user")}</th>
                  <th style={styles.th}>{t("childcare.session")}</th>
                  <th style={styles.th}>{t("childcare.children")}</th>
                  <th style={styles.th}>{t("common.price")}</th>
                  <th style={styles.th}>{t("common.status")}</th>
                </tr>
              </thead>
              <tbody>
                {garderieReservations.map((r) => (
                  <tr key={r.id}>
                    <td style={styles.td}>{r.userName}<br/><small style={{color:"#6b7280"}}>{r.userEmail}</small></td>
                    <td style={styles.td}>{r.sessionTitle}</td>
                    <td style={styles.td}>{r.numberOfChildren}</td>
                    <td style={styles.td}>{r.totalPrice?.toFixed(2)} €</td>
                    <td style={styles.td}>{getStatusBadge(r.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "1rem",
  },
  loading: {
    textAlign: "center",
    padding: "3rem",
    color: "#6b7280",
  },
  error: {
    padding: "1rem",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "8px",
  },
  title: {
    fontSize: "1.75rem",
    marginBottom: "1.5rem",
    color: "#111827",
  },
  alertBox: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem 1.5rem",
    background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    borderRadius: "12px",
    marginBottom: "1.5rem",
    cursor: "pointer",
    border: "1px solid #fcd34d",
  },
  alertIcon: {
    fontSize: "1.5rem",
  },
  alertAction: {
    marginLeft: "auto",
    color: "#92400e",
    fontWeight: "600",
  },
  tabsContainer: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
    marginBottom: "1.5rem",
    background: "#f3f4f6",
    padding: "0.5rem",
    borderRadius: "12px",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.6rem 1rem",
    border: "none",
    background: "transparent",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    color: "#6b7280",
    transition: "all 0.2s",
  },
  tabActive: {
    background: "#fff",
    color: "#111827",
    fontWeight: "600",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  tabBadge: {
    background: "#ef4444",
    color: "#fff",
    padding: "0.1rem 0.5rem",
    borderRadius: "10px",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  content: {
    background: "#fff",
    borderRadius: "16px",
    padding: "1.5rem",
    boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1.25rem",
    background: "#f9fafb",
    borderRadius: "12px",
    borderLeft: "4px solid #6366f1",
  },
  statIcon: {
    fontSize: "2rem",
  },
  statNumber: {
    display: "block",
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: "0.85rem",
    color: "#6b7280",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    margin: "0 0 1rem 0",
    color: "#111827",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  countBadge: {
    background: "#f3f4f6",
    padding: "0.35rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    color: "#6b7280",
  },
  quickActions: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
  quickAction: {
    padding: "0.75rem 1.25rem",
    background: "#f3f4f6",
    color: "#374151",
    textDecoration: "none",
    borderRadius: "10px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  addButton: {
    padding: "0.6rem 1.25rem",
    background: "#6366f1",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "8px",
    fontWeight: "500",
    fontSize: "0.9rem",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem",
    background: "#f9fafb",
    borderRadius: "12px",
  },
  emptyIcon: {
    fontSize: "3rem",
    display: "block",
    marginBottom: "1rem",
  },
  pendingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "1.5rem",
  },
  pendingCard: {
    background: "#fffbeb",
    borderRadius: "12px",
    border: "1px solid #fcd34d",
    overflow: "hidden",
  },
  pendingHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "1rem",
    borderBottom: "1px solid #fde68a",
    background: "#fef3c7",
  },
  pendingTitle: {
    margin: 0,
    fontSize: "1.1rem",
    color: "#111827",
  },
  pendingMeta: {
    padding: "1rem",
    fontSize: "0.9rem",
    lineHeight: "1.8",
  },
  pendingDesc: {
    padding: "0 1rem 1rem",
    fontSize: "0.85rem",
    color: "#6b7280",
  },
  pendingActions: {
    padding: "1rem",
    borderTop: "1px solid #fde68a",
    display: "flex",
    gap: "0.75rem",
    justifyContent: "flex-end",
  },
  btnApprove: {
    padding: "0.6rem 1.25rem",
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  btnReject: {
    padding: "0.6rem 1.25rem",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  btnCancel: {
    padding: "0.6rem 1.25rem",
    background: "#e5e7eb",
    color: "#374151",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "0.9rem",
  },
  rejectForm: {
    padding: "1rem",
    borderTop: "1px solid #fde68a",
  },
  rejectTextarea: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    marginBottom: "0.75rem",
    resize: "vertical",
    fontSize: "0.9rem",
    boxSizing: "border-box",
  },
  rejectActions: {
    display: "flex",
    gap: "0.75rem",
    justifyContent: "flex-end",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "0.75rem 1rem",
    textAlign: "left",
    background: "#f9fafb",
    borderBottom: "2px solid #e5e7eb",
    fontWeight: "600",
    color: "#374151",
    fontSize: "0.85rem",
  },
  td: {
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #e5e7eb",
    fontSize: "0.9rem",
  },
  linkBtn: {
    color: "#6366f1",
    textDecoration: "none",
    fontWeight: "500",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#ef4444",
    cursor: "pointer",
    fontWeight: "500",
  },
};
