import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  adminGetEspaces,
  adminDeleteEspace,
  adminGetEvents,
  adminGetGarderieSessions,
  adminDeleteGarderieSession,
  adminGetStats,
  adminGetAllSpaceReservations,
  adminGetAllEventRegistrations,
  adminGetAllGarderieReservations,
  adminGetPendingEvents,
  adminGetPendingReservations,
  adminApproveEvent,
  adminDeleteEvent,
  adminGetUsers,
  adminUpdateUserRole,
} from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const getDateLocale = () => {
    const locales = { fr: "fr-BE", nl: "nl-BE", en: "en-GB" };
    return locales[i18n.language] || "fr-BE";
  };

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
  const [users, setUsers] = useState([]);

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
        usersData,
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
        adminGetUsers(token),
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
      setUsers(usersData);
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
      loadData();
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

  const handleUpdateUserRole = async (userId, newRole) => {
    if (!window.confirm(t("admin.confirmRoleChange"))) return;
    try {
      await adminUpdateUserRole(userId, newRole, token);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteGarderieSession = async (id) => {
    if (!window.confirm(t("admin.confirmDeleteSession"))) return;
    try {
      await adminDeleteGarderieSession(id, token);
      setGarderieSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user || user.role !== "ADMIN") return null;
  if (loading) return <div className={styles.loading}>{t("common.loading")}</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  const tabs = [
    { id: "overview", label: t("admin.overview") },
    { id: "pendingEvents", label: t("admin.pendingEvents"), badge: pendingEvents.length },
    { id: "users", label: t("admin.usersManagement") },
    { id: "spaces", label: t("admin.spacesManagement") },
    { id: "events", label: t("admin.eventsManagement") },
    { id: "garderie", label: t("admin.childcareManagement") },
    { id: "pendingReservations", label: t("admin.pendingReservations"), badge: pendingReservations.length },
    { id: "spaceReservations", label: t("admin.spaceReservations") },
    { id: "eventReservations", label: t("admin.eventReservations") },
    { id: "garderieReservations", label: t("admin.garderieReservations") },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <p className={styles.kicker}>Admin</p>
          <h1 className={styles.title}>{t("admin.dashboard")}</h1>
          <p className={styles.subtitle}>{t("admin.dashboardSubtitle")}</p>
        </div>
        <Link to="/events" className={styles.backLink}>
          ← {t("common.backToSite")}
        </Link>
      </div>

      {pendingEvents.length > 0 && (
        <div className={styles.alertBanner}>
          <span className={styles.alertIcon}>⚠️</span>
          <span>
            {pendingEvents.length} {t("admin.eventsPendingApproval")}
          </span>
          <button
            className={styles.alertButton}
            onClick={() => setActiveTab("pendingEvents")}
          >
            {t("common.view")}
          </button>
        </div>
      )}

      {pendingReservations.length > 0 && (
        <div className={styles.alertBanner}>
          <span className={styles.alertIcon}>⚠️</span>
          <span>
            {pendingReservations.length} {t("admin.auditoriumReservationsPending")}
          </span>
          <button
            className={styles.alertButton}
            onClick={() => setActiveTab("pendingReservations")}
          >
            {t("common.view")}
          </button>
        </div>
      )}

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.badge ? <span className={styles.tabBadge}>{tab.badge}</span> : null}
          </button>
        ))}
      </div>

      {activeTab === "overview" && stats && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("admin.overview")}</h2>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>{t("admin.totalUsers")}</p>
              <p className={styles.statNumber}>{stats.totalUsers}</p>
            </div>
            <div className={`${styles.statCard} ${styles.statBlue}`}>
              <p className={styles.statLabel}>{t("admin.totalSpaces")}</p>
              <p className={styles.statNumber}>{stats.totalEspaces}</p>
            </div>
            <div className={`${styles.statCard} ${styles.statGreen}`}>
              <p className={styles.statLabel}>{t("admin.totalEvents")}</p>
              <p className={styles.statNumber}>{stats.totalEvents}</p>
            </div>
            <div className={`${styles.statCard} ${styles.statOrange}`}>
              <p className={styles.statLabel}>{t("admin.pendingApprovals")}</p>
              <p className={styles.statNumber}>{pendingEvents.length + pendingReservations.length}</p>
            </div>
          </div>

          <h3 className={styles.subsectionTitle}>{t("admin.reservationsOverview")}</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>{t("admin.confirmedSpaceRes")}</p>
              <p className={styles.statNumber}>{spaceReservations.filter(r => r.status === "CONFIRMED").length}</p>
            </div>
            <div className={`${styles.statCard} ${styles.statBlue}`}>
              <p className={styles.statLabel}>{t("admin.confirmedEventRes")}</p>
              <p className={styles.statNumber}>{eventRegistrations.filter(r => r.status === "CONFIRMED").length}</p>
            </div>
            <div className={`${styles.statCard} ${styles.statGreen}`}>
              <p className={styles.statLabel}>{t("admin.confirmedGarderieRes")}</p>
              <p className={styles.statNumber}>{garderieReservations.filter(r => r.status === "CONFIRMED").length}</p>
            </div>
          </div>

          <h3 className={styles.subsectionTitle}>{t("admin.revenue")}</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <p className={styles.statLabel}>{t("admin.spaceRevenue")}</p>
              <p className={styles.statNumber}>
                {spaceReservations.filter(r => r.status === "CONFIRMED").reduce((sum, r) => sum + (r.totalPrice || 0), 0).toFixed(2)} €
              </p>
            </div>
            <div className={`${styles.statCard} ${styles.statBlue}`}>
              <p className={styles.statLabel}>{t("admin.eventRevenue")}</p>
              <p className={styles.statNumber}>
                {eventRegistrations.filter(r => r.status === "CONFIRMED").reduce((sum, r) => sum + (r.totalPrice || 0), 0).toFixed(2)} €
              </p>
            </div>
            <div className={`${styles.statCard} ${styles.statGreen}`}>
              <p className={styles.statLabel}>{t("admin.garderieRevenue")}</p>
              <p className={styles.statNumber}>
                {garderieReservations.filter(r => r.status === "CONFIRMED").reduce((sum, r) => sum + (r.totalPrice || 0), 0).toFixed(2)} €
              </p>
            </div>
            <div className={`${styles.statCard} ${styles.statPurple}`}>
              <p className={styles.statLabel}>{t("admin.totalRevenue")}</p>
              <p className={styles.statNumber}>
                {(
                  spaceReservations.filter(r => r.status === "CONFIRMED").reduce((sum, r) => sum + (r.totalPrice || 0), 0) +
                  eventRegistrations.filter(r => r.status === "CONFIRMED").reduce((sum, r) => sum + (r.totalPrice || 0), 0) +
                  garderieReservations.filter(r => r.status === "CONFIRMED").reduce((sum, r) => sum + (r.totalPrice || 0), 0)
                ).toFixed(2)} €
              </p>
            </div>
          </div>
        </section>
      )}

      {activeTab === "pendingEvents" && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t("admin.pendingEvents")}</h2>
            <Link to="/admin/events/pending" className={styles.linkGhost}>
              {t("common.viewAll")}
            </Link>
          </div>
          <div className={styles.grid}>
            {pendingEvents.map((e) => (
              <div key={e.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <p className={styles.cardDate}>{new Date(e.startDateTime).toLocaleString(getDateLocale())}</p>
                    <h3 className={styles.cardTitle}>{e.title}</h3>
                    <p className={styles.cardMeta}>
                      {t("organizer.createdBy")}: {e.createdByName}
                    </p>
                  </div>
                  <span className={`${styles.badge} ${styles.badgePending}`}>{t("status.pending_approval")}</span>
                </div>
                <p className={styles.cardDesc}>{e.description}</p>
                <div className={styles.cardActions}>
                  {rejectingEventId === e.id ? (
                    <div className={styles.rejectBox}>
                      <textarea
                        placeholder={t("admin.rejectionReasonPlaceholder")}
                        value={rejectionReason}
                        onChange={(ev) => setRejectionReason(ev.target.value)}
                        className={styles.textarea}
                      />
                      <div className={styles.rejectActions}>
                        <button onClick={() => setRejectingEventId(null)} className={styles.btnGhost}>
                          {t("common.cancel")}
                        </button>
                        <button onClick={() => handleRejectEvent(e.id)} className={styles.btnDanger}>
                          {t("admin.confirmReject")}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => handleApproveEvent(e.id)} className={styles.btnSuccess}>
                        {t("admin.approve")}
                      </button>
                      <button onClick={() => setRejectingEventId(e.id)} className={styles.btnDanger}>
                        {t("admin.reject")}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "pendingReservations" && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t("admin.auditoriumReservationsPending")}</h2>
            <Link to="/admin/reservations/pending" className={styles.linkGhost}>
              {t("common.viewAll")}
            </Link>
          </div>
          <div className={styles.grid}>
            {pendingReservations.map((r) => (
              <div key={r.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <p className={styles.cardDate}>{r.startDateTime}</p>
                    <h3 className={styles.cardTitle}>{r.espace?.name || t("spaces.space")}</h3>
                    <p className={styles.cardMeta}>{r.user?.email}</p>
                  </div>
                  <span className={`${styles.badge} ${styles.badgePending}`}>{t("status.pending_approval")}</span>
                </div>
                {r.justification ? <p className={styles.cardDesc}>{r.justification}</p> : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "users" && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("admin.usersManagement")}</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("common.name")}</th>
                  <th>{t("common.email")}</th>
                  <th>{t("admin.role")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.firstName} {u.lastName}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(ev) => handleUpdateUserRole(u.id, ev.target.value)}
                        className={styles.select}
                      >
                        <option value="MEMBER">Member</option>
                        <option value="ORGANIZER">Organizer</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "spaces" && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t("admin.spacesManagement")}</h2>
            <Link to="/admin/espaces/new" className={styles.btnPrimary}>
              + {t("admin.createSpace")}
            </Link>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("common.title")}</th>
                  <th>{t("common.capacity")}</th>
                  <th>{t("spaces.basePrice")}</th>
                  <th>{t("common.actions")}</th>
                  <th>{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {espaces.map((e) => (
                  <tr key={e.id}>
                    <td>{e.name}</td>
                    <td>{e.capacity}</td>
                    <td>{e.basePrice} €</td>
                    <td>
                      <Link to={`/admin/espaces/${e.id}/edit`} className={styles.btnGhostSmall}>
                        {t("common.edit")}
                      </Link>
                    </td>
                    <td>
                      <button onClick={() => handleDeleteEspace(e.id)} className={styles.btnDangerSmall}>
                        {t("common.delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "events" && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t("admin.eventsManagement")}</h2>
            <Link to="/admin/events/new" className={styles.btnPrimary}>
              + {t("admin.createEvent")}
            </Link>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("common.title")}</th>
                  <th>{t("common.date")}</th>
                  <th>{t("common.price")}</th>
                  <th>{t("common.actions")}</th>
                  <th>{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td>{e.title}</td>
                    <td>{new Date(e.startDateTime).toLocaleString(getDateLocale())}</td>
                    <td>{e.price ? `${e.price} €` : t("events.free")}</td>
                    <td>
                      <Link to={`/admin/events/${e.id}/edit`} className={styles.btnGhostSmall}>
                        {t("common.edit")}
                      </Link>
                    </td>
                    <td>
                      <button onClick={() => handleDeleteEvent(e.id)} className={styles.btnDangerSmall}>
                        {t("common.delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "garderie" && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t("admin.childcareManagement")}</h2>
            <Link to="/admin/garderie/new" className={styles.btnPrimary}>
              + {t("admin.createSession")}
            </Link>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("common.title")}</th>
                  <th>{t("common.date")}</th>
                  <th>{t("common.time")}</th>
                  <th>{t("childcare.pricePerChild")}</th>
                  <th>{t("common.actions")}</th>
                  <th>{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {garderieSessions.map((s) => (
                  <tr key={s.id}>
                    <td>{s.title}</td>
                    <td>{s.sessionDate}</td>
                    <td>{s.startTime} - {s.endTime}</td>
                    <td>{s.pricePerChild} €</td>
                    <td>
                      <Link to={`/admin/garderie/edit/${s.id}`} className={styles.btnGhostSmall}>
                        {t("common.edit")}
                      </Link>
                    </td>
                    <td>
                      <button onClick={() => handleDeleteGarderieSession(s.id)} className={styles.btnDangerSmall}>
                        {t("common.delete")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "spaceReservations" && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("admin.spaceReservations")}</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("spaces.space")}</th>
                  <th>{t("admin.user")}</th>
                  <th>{t("common.date")}</th>
                  <th>{t("common.total")}</th>
                </tr>
              </thead>
              <tbody>
                {spaceReservations.map((r) => (
                  <tr key={r.id}>
                    <td>{r.espaceName}</td>
                    <td>{r.userEmail}</td>
                    <td>{new Date(r.startDateTime).toLocaleString(getDateLocale())}</td>
                    <td>{r.totalPrice} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "eventReservations" && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("admin.eventReservations")}</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("common.title")}</th>
                  <th>{t("admin.user")}</th>
                  <th>{t("common.date")}</th>
                  <th>{t("common.total")}</th>
                </tr>
              </thead>
              <tbody>
                {eventRegistrations.map((r) => (
                  <tr key={r.id}>
                    <td>{r.eventTitle}</td>
                    <td>{r.userEmail}</td>
                    <td>{new Date(r.eventDate).toLocaleString(getDateLocale())}</td>
                    <td>{r.totalPrice} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "garderieReservations" && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("admin.garderieReservations")}</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("common.title")}</th>
                  <th>{t("admin.user")}</th>
                  <th>{t("common.date")}</th>
                  <th>{t("admin.qty")}</th>
                  <th>{t("common.total")}</th>
                </tr>
              </thead>
              <tbody>
                {garderieReservations.map((r) => (
                  <tr key={r.id}>
                    <td>{r.sessionTitle}</td>
                    <td>{r.userEmail}</td>
                    <td>{r.sessionDate}</td>
                    <td>{r.numberOfChildren}</td>
                    <td>{r.totalPrice} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
