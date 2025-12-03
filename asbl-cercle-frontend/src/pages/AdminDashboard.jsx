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
  const [garderieSessions, setGarderieSessions] = useState([]);
  const [spaceReservations, setSpaceReservations] = useState([]);
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [garderieReservations, setGarderieReservations] = useState([]);

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
        garderieData,
        spaceResData,
        eventResData,
        garderieResData,
      ] = await Promise.all([
        adminGetStats(token),
        adminGetEspaces(token),
        adminGetEvents(token),
        adminGetGarderieSessions(token),
        adminGetAllSpaceReservations(token),
        adminGetAllEventRegistrations(token),
        adminGetAllGarderieReservations(token),
      ]);

      setStats(statsData);
      setEspaces(espacesData);
      setEvents(eventsData);
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

  if (!user || user.role !== "ADMIN") return null;
  if (loading) return <p>{t("common.loading")}</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const tabs = [
    { id: "overview", label: t("admin.overview") },
    { id: "spaces", label: t("admin.spacesManagement") },
    { id: "events", label: t("admin.eventsManagement") },
    { id: "garderie", label: t("admin.childcareManagement") },
    { id: "spaceReservations", label: t("admin.spaceReservations") },
    { id: "eventReservations", label: t("admin.eventReservations") },
    { id: "garderieReservations", label: t("admin.garderieReservations") },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{t("admin.dashboard")}</h1>

      <div style={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.activeTab : {}),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {activeTab === "overview" && <OverviewTab stats={stats} t={t} />}
        {activeTab === "spaces" && (
          <SpacesTab espaces={espaces} onDelete={handleDeleteEspace} t={t} />
        )}
        {activeTab === "events" && <EventsTab events={events} t={t} />}
        {activeTab === "garderie" && <GarderieTab sessions={garderieSessions} t={t} />}
        {activeTab === "spaceReservations" && (
          <SpaceReservationsTab reservations={spaceReservations} t={t} />
        )}
        {activeTab === "eventReservations" && (
          <EventReservationsTab registrations={eventRegistrations} t={t} />
        )}
        {activeTab === "garderieReservations" && (
          <GarderieReservationsTab reservations={garderieReservations} t={t} />
        )}
      </div>
    </div>
  );
}

function OverviewTab({ stats, t }) {
  return (
    <div>
      <h2 style={styles.sectionTitle}>{t("admin.statistics")}</h2>

      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, background: "#dbeafe" }}>
          <div style={styles.statValue}>{stats?.totalUsers || 0}</div>
          <div style={styles.statLabel}>{t("admin.totalUsers")}</div>
        </div>
        <div style={{ ...styles.statCard, background: "#dcfce7" }}>
          <div style={styles.statValue}>{stats?.totalEspaces || 0}</div>
          <div style={styles.statLabel}>{t("admin.totalSpaces")}</div>
        </div>
        <div style={{ ...styles.statCard, background: "#fef3c7" }}>
          <div style={styles.statValue}>{stats?.totalEvents || 0}</div>
          <div style={styles.statLabel}>{t("admin.totalEvents")}</div>
        </div>
        <div style={{ ...styles.statCard, background: "#fce7f3" }}>
          <div style={styles.statValue}>{stats?.totalGarderieSessions || 0}</div>
          <div style={styles.statLabel}>{t("admin.totalSessions")}</div>
        </div>
      </div>

      <h3 style={styles.subTitle}>{t("admin.reservationsOverview")}</h3>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats?.confirmedSpaceReservations || 0}</div>
          <div style={styles.statLabel}>{t("admin.confirmedSpaceRes")}</div>
          <div style={styles.statSub}>
            ({stats?.cancelledSpaceReservations || 0} {t("status.cancelled").toLowerCase()})
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats?.confirmedEventRegistrations || 0}</div>
          <div style={styles.statLabel}>{t("admin.confirmedEventRes")}</div>
          <div style={styles.statSub}>
            ({stats?.cancelledEventRegistrations || 0} {t("status.cancelled").toLowerCase()})
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats?.confirmedGarderieReservations || 0}</div>
          <div style={styles.statLabel}>{t("admin.confirmedGarderieRes")}</div>
          <div style={styles.statSub}>
            ({stats?.cancelledGarderieReservations || 0} {t("status.cancelled").toLowerCase()})
          </div>
        </div>
      </div>

      <h3 style={styles.subTitle}>{t("admin.revenue")}</h3>
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, background: "#d1fae5" }}>
          <div style={styles.statValue}>{(stats?.spaceRevenue || 0).toFixed(2)} €</div>
          <div style={styles.statLabel}>{t("admin.spaceRevenue")}</div>
        </div>
        <div style={{ ...styles.statCard, background: "#d1fae5" }}>
          <div style={styles.statValue}>{(stats?.eventRevenue || 0).toFixed(2)} €</div>
          <div style={styles.statLabel}>{t("admin.eventRevenue")}</div>
        </div>
        <div style={{ ...styles.statCard, background: "#d1fae5" }}>
          <div style={styles.statValue}>{(stats?.garderieRevenue || 0).toFixed(2)} €</div>
          <div style={styles.statLabel}>{t("admin.garderieRevenue")}</div>
        </div>
        <div style={{ ...styles.statCard, background: "#bbf7d0" }}>
          <div style={{ ...styles.statValue, fontSize: "2rem" }}>
            {(stats?.totalRevenue || 0).toFixed(2)} €
          </div>
          <div style={{ ...styles.statLabel, fontWeight: "bold" }}>
            {t("admin.totalRevenue")}
          </div>
        </div>
      </div>
    </div>
  );
}

function SpacesTab({ espaces, onDelete, t }) {
  return (
    <div>
      <div style={styles.headerRow}>
        <h2 style={styles.sectionTitle}>{t("admin.spacesManagement")}</h2>
        <Link to="/admin/espaces/new" style={styles.addButton}>
          + {t("admin.createSpace")}
        </Link>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>{t("admin.name")}</th>
            <th style={styles.th}>{t("common.type")}</th>
            <th style={styles.th}>{t("common.capacity")}</th>
            <th style={styles.th}>{t("admin.basePrice")}</th>
            <th style={styles.th}>{t("common.status")}</th>
            <th style={styles.th}>{t("common.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {espaces.map((e) => (
            <tr key={e.id}>
              <td style={styles.td}>{e.id}</td>
              <td style={styles.td}>{e.name}</td>
              <td style={styles.td}>{e.type}</td>
              <td style={styles.td}>{e.capacity}</td>
              <td style={styles.td}>{e.basePrice} €</td>
              <td style={styles.td}>
                <span style={e.status === "AVAILABLE" ? styles.statusGreen : styles.statusRed}>
                  {t(`status.${e.status.toLowerCase()}`)}
                </span>
              </td>
              <td style={styles.td}>
                <Link to={`/admin/espaces/${e.id}/edit`} style={styles.link}>{t("common.edit")}</Link>
                {" | "}
                <button onClick={() => onDelete(e.id)} style={styles.deleteBtn}>{t("common.delete")}</button>
              </td>
            </tr>
          ))}
          {espaces.length === 0 && (
            <tr><td colSpan="7" style={styles.noData}>{t("admin.noSpaces")}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function EventsTab({ events, t }) {
  return (
    <div>
      <div style={styles.headerRow}>
        <h2 style={styles.sectionTitle}>{t("admin.eventsManagement")}</h2>
        <Link to="/admin/events/new" style={styles.addButton}>+ {t("admin.createEvent")}</Link>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>{t("common.title")}</th>
            <th style={styles.th}>{t("common.date")}</th>
            <th style={styles.th}>{t("common.capacity")}</th>
            <th style={styles.th}>{t("admin.registered")}</th>
            <th style={styles.th}>{t("admin.available")}</th>
            <th style={styles.th}>{t("common.price")}</th>
            <th style={styles.th}>{t("common.status")}</th>
            <th style={styles.th}>{t("common.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id}>
              <td style={styles.td}>{e.id}</td>
              <td style={styles.td}>{e.title}</td>
              <td style={styles.td}>{e.startDateTime?.replace("T", " ")}</td>
              <td style={styles.td}>{e.capacity || "-"}</td>
              <td style={styles.td}>{e.registeredCount || 0}</td>
              <td style={styles.td}>
                {e.capacity ? (
                  <span style={e.availablePlaces > 0 ? styles.statusGreen : styles.statusRed}>
                    {e.availablePlaces}
                  </span>
                ) : "-"}
              </td>
              <td style={styles.td}>{e.price ? `${e.price} €` : t("events.free")}</td>
              <td style={styles.td}>
                <span style={e.status === "PUBLISHED" ? styles.statusGreen : e.status === "CANCELLED" ? styles.statusRed : styles.statusYellow}>
                  {t(`status.${e.status.toLowerCase()}`)}
                </span>
              </td>
              <td style={styles.td}>
                <Link to={`/admin/events/${e.id}/edit`} style={styles.link}>{t("common.edit")}</Link>
              </td>
            </tr>
          ))}
          {events.length === 0 && (
            <tr><td colSpan="9" style={styles.noData}>{t("admin.noEvents")}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function GarderieTab({ sessions, t }) {
  return (
    <div>
      <div style={styles.headerRow}>
        <h2 style={styles.sectionTitle}>{t("admin.childcareManagement")}</h2>
        <Link to="/admin/garderie/new" style={styles.addButton}>+ {t("admin.createSession")}</Link>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>{t("common.title")}</th>
            <th style={styles.th}>{t("common.date")}</th>
            <th style={styles.th}>{t("common.time")}</th>
            <th style={styles.th}>{t("common.capacity")}</th>
            <th style={styles.th}>{t("admin.registered")}</th>
            <th style={styles.th}>{t("admin.available")}</th>
            <th style={styles.th}>{t("childcare.pricePerChild")}</th>
            <th style={styles.th}>{t("common.status")}</th>
            <th style={styles.th}>{t("common.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.id}>
              <td style={styles.td}>{s.id}</td>
              <td style={styles.td}>{s.title}</td>
              <td style={styles.td}>{s.sessionDate}</td>
              <td style={styles.td}>{s.startTime} - {s.endTime}</td>
              <td style={styles.td}>{s.capacity}</td>
              <td style={styles.td}>{s.registeredCount || 0}</td>
              <td style={styles.td}>
                <span style={(s.availablePlaces ?? s.capacity) > 0 ? styles.statusGreen : styles.statusRed}>
                  {s.availablePlaces ?? s.capacity}
                </span>
              </td>
              <td style={styles.td}>{s.pricePerChild} €</td>
              <td style={styles.td}>
                <span style={s.status === "OPEN" ? styles.statusGreen : s.status === "CANCELLED" ? styles.statusRed : styles.statusYellow}>
                  {t(`status.${s.status.toLowerCase()}`)}
                </span>
              </td>
              <td style={styles.td}>
                <Link to={`/admin/garderie/edit/${s.id}`} style={styles.link}>{t("common.edit")}</Link>
              </td>
            </tr>
          ))}
          {sessions.length === 0 && (
            <tr><td colSpan="10" style={styles.noData}>{t("admin.noSessions")}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SpaceReservationsTab({ reservations, t }) {
  return (
    <div>
      <h2 style={styles.sectionTitle}>{t("admin.spaceReservations")}</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>{t("admin.user")}</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>{t("spaces.space")}</th>
            <th style={styles.th}>{t("reservation.startDate")}</th>
            <th style={styles.th}>{t("reservation.endDate")}</th>
            <th style={styles.th}>{t("common.total")}</th>
            <th style={styles.th}>{t("common.status")}</th>
            <th style={styles.th}>{t("admin.createdAt")}</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id}>
              <td style={styles.td}>{r.id}</td>
              <td style={styles.td}>{r.userName}</td>
              <td style={styles.td}>{r.userEmail}</td>
              <td style={styles.td}>{r.espaceName}</td>
              <td style={styles.td}>{r.startDateTime?.replace("T", " ")}</td>
              <td style={styles.td}>{r.endDateTime?.replace("T", " ")}</td>
              <td style={styles.td}>{r.totalPrice} €</td>
              <td style={styles.td}>
                <span style={r.status === "CONFIRMED" ? styles.statusGreen : styles.statusRed}>
                  {t(`status.${r.status.toLowerCase()}`)}
                </span>
              </td>
              <td style={styles.td}>{r.createdAt?.replace("T", " ").substring(0, 16)}</td>
            </tr>
          ))}
          {reservations.length === 0 && (
            <tr><td colSpan="9" style={styles.noData}>{t("admin.noReservations")}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function EventReservationsTab({ registrations, t }) {
  return (
    <div>
      <h2 style={styles.sectionTitle}>{t("admin.eventReservations")}</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>{t("admin.user")}</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>{t("events.event")}</th>
            <th style={styles.th}>{t("common.date")}</th>
            <th style={styles.th}>{t("events.participants")}</th>
            <th style={styles.th}>{t("common.total")}</th>
            <th style={styles.th}>{t("common.status")}</th>
            <th style={styles.th}>{t("admin.createdAt")}</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((r) => (
            <tr key={r.id}>
              <td style={styles.td}>{r.id}</td>
              <td style={styles.td}>{r.userName}</td>
              <td style={styles.td}>{r.userEmail}</td>
              <td style={styles.td}>{r.eventTitle}</td>
              <td style={styles.td}>{r.eventDate?.replace("T", " ")}</td>
              <td style={styles.td}>{r.numberOfParticipants}</td>
              <td style={styles.td}>{r.totalPrice} €</td>
              <td style={styles.td}>
                <span style={r.status === "CONFIRMED" ? styles.statusGreen : styles.statusRed}>
                  {t(`status.${r.status.toLowerCase()}`)}
                </span>
              </td>
              <td style={styles.td}>{r.createdAt?.replace("T", " ").substring(0, 16)}</td>
            </tr>
          ))}
          {registrations.length === 0 && (
            <tr><td colSpan="9" style={styles.noData}>{t("admin.noReservations")}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function GarderieReservationsTab({ reservations, t }) {
  return (
    <div>
      <h2 style={styles.sectionTitle}>{t("admin.garderieReservations")}</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>{t("admin.user")}</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>{t("childcare.session")}</th>
            <th style={styles.th}>{t("common.date")}</th>
            <th style={styles.th}>{t("common.children")}</th>
            <th style={styles.th}>{t("common.total")}</th>
            <th style={styles.th}>{t("common.status")}</th>
            <th style={styles.th}>{t("admin.createdAt")}</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => (
            <tr key={r.id}>
              <td style={styles.td}>{r.id}</td>
              <td style={styles.td}>{r.userName}</td>
              <td style={styles.td}>{r.userEmail}</td>
              <td style={styles.td}>{r.sessionTitle}</td>
              <td style={styles.td}>{r.sessionDate}</td>
              <td style={styles.td}>{r.numberOfChildren}</td>
              <td style={styles.td}>{r.totalPrice} €</td>
              <td style={styles.td}>
                <span style={r.status === "CONFIRMED" ? styles.statusGreen : styles.statusRed}>
                  {t(`status.${r.status.toLowerCase()}`)}
                </span>
              </td>
              <td style={styles.td}>{r.createdAt?.replace("T", " ").substring(0, 16)}</td>
            </tr>
          ))}
          {reservations.length === 0 && (
            <tr><td colSpan="9" style={styles.noData}>{t("admin.noReservations")}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: { maxWidth: "1400px", margin: "0 auto" },
  title: { fontSize: "2rem", marginBottom: "1.5rem", color: "#1f2937" },
  tabs: { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "2px solid #e5e7eb", paddingBottom: "0.5rem" },
  tab: { padding: "0.6rem 1rem", border: "none", background: "#f3f4f6", borderRadius: "6px 6px 0 0", cursor: "pointer", fontSize: "0.9rem", color: "#374151" },
  activeTab: { background: "#2563eb", color: "#fff" },
  content: { background: "#fff", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
  sectionTitle: { fontSize: "1.4rem", marginBottom: "1rem", color: "#1f2937" },
  subTitle: { fontSize: "1.1rem", marginTop: "2rem", marginBottom: "1rem", color: "#374151" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" },
  statCard: { background: "#f9fafb", borderRadius: "8px", padding: "1.25rem", textAlign: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" },
  statValue: { fontSize: "1.75rem", fontWeight: "bold", color: "#1f2937" },
  statLabel: { fontSize: "0.9rem", color: "#6b7280", marginTop: "0.25rem" },
  statSub: { fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.25rem" },
  headerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },
  addButton: { padding: "0.6rem 1rem", background: "#2563eb", color: "#fff", textDecoration: "none", borderRadius: "6px", fontSize: "0.9rem" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" },
  th: { border: "1px solid #e5e7eb", padding: "0.75rem", textAlign: "left", background: "#f9fafb", fontWeight: "600", color: "#374151" },
  td: { border: "1px solid #e5e7eb", padding: "0.75rem", textAlign: "left" },
  link: { color: "#2563eb", textDecoration: "none" },
  deleteBtn: { background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: "0.9rem" },
  statusGreen: { color: "#059669", fontWeight: "500" },
  statusRed: { color: "#dc2626", fontWeight: "500" },
  statusYellow: { color: "#d97706", fontWeight: "500" },
  noData: { textAlign: "center", padding: "2rem", color: "#9ca3af" },
};