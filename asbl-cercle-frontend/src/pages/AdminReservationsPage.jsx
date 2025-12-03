import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminGetAllReservations } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function AdminReservationsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtres
  const [filterType, setFilterType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }

    adminGetAllReservations(token)
      .then((data) => {
        setReservations(data);
        setFilteredReservations(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, token, navigate]);

  // Appliquer les filtres
  useEffect(() => {
    let result = [...reservations];

    // Filtre par type
    if (filterType !== "ALL") {
      result = result.filter((r) => r.type === filterType);
    }

    // Filtre par statut
    if (filterStatus !== "ALL") {
      result = result.filter((r) => r.status === filterStatus);
    }

    // Recherche
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          r.userFullName.toLowerCase().includes(term) ||
          r.userEmail.toLowerCase().includes(term) ||
          r.itemName.toLowerCase().includes(term)
      );
    }

    setFilteredReservations(result);
  }, [filterType, filterStatus, searchTerm, reservations]);

  // Statistiques
  const stats = {
    total: reservations.length,
    espaces: reservations.filter((r) => r.type === "ESPACE").length,
    events: reservations.filter((r) => r.type === "EVENT").length,
    garderie: reservations.filter((r) => r.type === "GARDERIE").length,
    confirmed: reservations.filter((r) => r.status === "CONFIRMED").length,
    cancelled: reservations.filter((r) => r.status === "CANCELLED").length,
    totalRevenue: reservations
      .filter((r) => r.status === "CONFIRMED" && r.paid)
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0),
  };

  if (!user || user.role !== "ADMIN") return null;
  if (loading) return <p>{t("common.loading")}</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>{t("admin.allReservations")}</h1>

      <p>
        <Link to="/admin">← {t("admin.backToDashboard")}</Link>
      </p>

      {/* Statistiques */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>{stats.total}</span>
          <span style={styles.statLabel}>{t("admin.totalReservations")}</span>
        </div>
        <div style={{ ...styles.statCard, borderColor: "#3b82f6" }}>
          <span style={styles.statNumber}>{stats.espaces}</span>
          <span style={styles.statLabel}>{t("nav.spaces")}</span>
        </div>
        <div style={{ ...styles.statCard, borderColor: "#8b5cf6" }}>
          <span style={styles.statNumber}>{stats.events}</span>
          <span style={styles.statLabel}>{t("nav.events")}</span>
        </div>
        <div style={{ ...styles.statCard, borderColor: "#ec4899" }}>
          <span style={styles.statNumber}>{stats.garderie}</span>
          <span style={styles.statLabel}>{t("nav.childcare")}</span>
        </div>
        <div style={{ ...styles.statCard, borderColor: "#10b981" }}>
          <span style={styles.statNumber}>{stats.totalRevenue.toFixed(2)} €</span>
          <span style={styles.statLabel}>{t("admin.revenue")}</span>
        </div>
      </div>

      {/* Filtres */}
      <div style={styles.filtersContainer}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>{t("admin.filterByType")}</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={styles.select}
          >
            <option value="ALL">{t("common.all")}</option>
            <option value="ESPACE">{t("nav.spaces")}</option>
            <option value="EVENT">{t("nav.events")}</option>
            <option value="GARDERIE">{t("nav.childcare")}</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>{t("admin.filterByStatus")}</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.select}
          >
            <option value="ALL">{t("common.all")}</option>
            <option value="CONFIRMED">{t("status.confirmed")}</option>
            <option value="PENDING">{t("status.pending")}</option>
            <option value="CANCELLED">{t("status.cancelled")}</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>{t("admin.search")}</label>
          <input
            type="text"
            placeholder={t("admin.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Tableau */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>{t("common.type")}</th>
              <th style={styles.th}>{t("admin.user")}</th>
              <th style={styles.th}>{t("admin.item")}</th>
              <th style={styles.th}>{t("common.date")}</th>
              <th style={styles.th}>{t("admin.qty")}</th>
              <th style={styles.th}>{t("common.total")}</th>
              <th style={styles.th}>{t("common.status")}</th>
              <th style={styles.th}>{t("admin.payment")}</th>
              <th style={styles.th}>{t("admin.createdAt")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.length === 0 ? (
              <tr>
                <td colSpan="9" style={styles.noData}>
                  {t("common.noData")}
                </td>
              </tr>
            ) : (
              filteredReservations.map((r) => (
                <tr key={`${r.type}-${r.id}`} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={{ ...styles.typeBadge, ...getTypeBadgeStyle(r.type) }}>
                      {r.typeName}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.userInfo}>
                      <span style={styles.userName}>{r.userFullName}</span>
                      <span style={styles.userEmail}>{r.userEmail}</span>
                    </div>
                  </td>
                  <td style={styles.td}>{r.itemName}</td>
                  <td style={styles.td}>{r.dateInfo}</td>
                  <td style={styles.td}>{r.quantity || "-"}</td>
                  <td style={styles.td}>{r.totalPrice ? `${r.totalPrice} €` : t("events.free")}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.statusBadge, ...getStatusBadgeStyle(r.status) }}>
                      {t(`status.${r.status.toLowerCase()}`)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {r.paid ? (
                      <span style={styles.paidBadge}>✓ {t("admin.paid")}</span>
                    ) : r.totalPrice > 0 ? (
                      <span style={styles.unpaidBadge}>{t("admin.unpaid")}</span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td style={styles.td}>
                    {new Date(r.createdAt).toLocaleDateString("fr-BE")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p style={styles.resultCount}>
        {filteredReservations.length} / {reservations.length} {t("admin.reservationsShown")}
      </p>
    </div>
  );
}

const getTypeBadgeStyle = (type) => {
  switch (type) {
    case "ESPACE":
      return { background: "#dbeafe", color: "#1d4ed8" };
    case "EVENT":
      return { background: "#ede9fe", color: "#6d28d9" };
    case "GARDERIE":
      return { background: "#fce7f3", color: "#be185d" };
    default:
      return { background: "#f3f4f6", color: "#374151" };
  }
};

const getStatusBadgeStyle = (status) => {
  switch (status) {
    case "CONFIRMED":
      return { background: "#d1fae5", color: "#065f46" };
    case "PENDING":
      return { background: "#fef3c7", color: "#92400e" };
    case "CANCELLED":
      return { background: "#fee2e2", color: "#991b1b" };
    default:
      return { background: "#f3f4f6", color: "#374151" };
  }
};

const styles = {
  statsContainer: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
  },
  statCard: {
    background: "#fff",
    padding: "1rem 1.5rem",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    borderLeft: "4px solid #6b7280",
    display: "flex",
    flexDirection: "column",
    minWidth: "120px",
  },
  statNumber: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#1f2937",
  },
  statLabel: {
    fontSize: "0.85rem",
    color: "#6b7280",
  },
  filtersContainer: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    background: "#fff",
    padding: "1rem",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },
  filterLabel: {
    fontSize: "0.8rem",
    fontWeight: "500",
    color: "#6b7280",
  },
  select: {
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "0.9rem",
    minWidth: "150px",
  },
  searchInput: {
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "0.9rem",
    minWidth: "250px",
  },
  tableContainer: {
    overflowX: "auto",
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#374151",
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid #e5e7eb",
  },
  td: {
    padding: "0.75rem 1rem",
    fontSize: "0.9rem",
    color: "#374151",
    verticalAlign: "middle",
  },
  noData: {
    padding: "2rem",
    textAlign: "center",
    color: "#9ca3af",
  },
  typeBadge: {
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "500",
  },
  statusBadge: {
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "500",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
  },
  userName: {
    fontWeight: "500",
  },
  userEmail: {
    fontSize: "0.8rem",
    color: "#6b7280",
  },
  paidBadge: {
    color: "#059669",
    fontWeight: "500",
  },
  unpaidBadge: {
    color: "#dc2626",
    fontWeight: "500",
  },
  resultCount: {
    marginTop: "1rem",
    color: "#6b7280",
    fontSize: "0.9rem",
  },
};
