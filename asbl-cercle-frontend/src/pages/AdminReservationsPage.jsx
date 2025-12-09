import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminGetAllReservations } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import styles from "./AdminReservationsPage.module.css";

export default function AdminReservationsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  useEffect(() => {
    let result = [...reservations];

    if (filterType !== "ALL") {
      result = result.filter((r) => r.type === filterType);
    }
    if (filterStatus !== "ALL") {
      result = result.filter((r) => r.status === filterStatus);
    }
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

  const typeClass = (type) => {
    const map = {
      ESPACE: styles.typeSpace,
      EVENT: styles.typeEvent,
      GARDERIE: styles.typeGarderie,
    };
    return `${styles.typeBadge} ${map[type] || styles.typeDefault}`;
  };

  const statusClass = (status) => {
    const map = {
      CONFIRMED: styles.statusConfirmed,
      PENDING: styles.statusPending,
      CANCELLED: styles.statusCancelled,
    };
    return `${styles.statusBadge} ${map[status] || styles.statusDefault}`;
  };

  if (!user || user.role !== "ADMIN") return null;
  if (loading) return <p className={styles.info}>{t("common.loading")}</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t("admin.allReservations")}</h1>

      <p className={styles.linkRow}>
        <Link to="/admin" className={styles.linkGhost}>
          ← {t("admin.backToDashboard")}
        </Link>
      </p>

      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{stats.total}</span>
          <span className={styles.statLabel}>{t("admin.totalReservations")}</span>
        </div>
        <div className={`${styles.statCard} ${styles.statBlue}`}>
          <span className={styles.statNumber}>{stats.espaces}</span>
          <span className={styles.statLabel}>{t("nav.spaces")}</span>
        </div>
        <div className={`${styles.statCard} ${styles.statPurple}`}>
          <span className={styles.statNumber}>{stats.events}</span>
          <span className={styles.statLabel}>{t("nav.events")}</span>
        </div>
        <div className={`${styles.statCard} ${styles.statPink}`}>
          <span className={styles.statNumber}>{stats.garderie}</span>
          <span className={styles.statLabel}>{t("nav.childcare")}</span>
        </div>
        <div className={`${styles.statCard} ${styles.statGreen}`}>
          <span className={styles.statNumber}>{stats.totalRevenue.toFixed(2)} €</span>
          <span className={styles.statLabel}>{t("admin.revenue")}</span>
        </div>
      </div>

      <div className={styles.filtersContainer}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>{t("admin.filterByType")}</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className={styles.select}>
            <option value="ALL">{t("common.all")}</option>
            <option value="ESPACE">{t("nav.spaces")}</option>
            <option value="EVENT">{t("nav.events")}</option>
            <option value="GARDERIE">{t("nav.childcare")}</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>{t("admin.filterByStatus")}</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={styles.select}>
            <option value="ALL">{t("common.all")}</option>
            <option value="CONFIRMED">{t("status.confirmed")}</option>
            <option value="PENDING">{t("status.pending")}</option>
            <option value="CANCELLED">{t("status.cancelled")}</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>{t("admin.search")}</label>
          <input
            type="text"
            placeholder={t("admin.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>{t("common.type")}</th>
              <th className={styles.th}>{t("admin.user")}</th>
              <th className={styles.th}>{t("admin.item")}</th>
              <th className={styles.th}>{t("common.date")}</th>
              <th className={styles.th}>{t("admin.qty")}</th>
              <th className={styles.th}>{t("common.total")}</th>
              <th className={styles.th}>{t("common.status")}</th>
              <th className={styles.th}>{t("admin.payment")}</th>
              <th className={styles.th}>{t("admin.createdAt")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.length === 0 ? (
              <tr>
                <td colSpan="9" className={styles.noData}>
                  {t("common.noData")}
                </td>
              </tr>
            ) : (
              filteredReservations.map((r) => (
                <tr key={`${r.type}-${r.id}`} className={styles.tr}>
                  <td className={styles.td}>
                    <span className={typeClass(r.type)}>{r.typeName}</span>
                  </td>
                  <td className={styles.td}>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{r.userFullName}</span>
                      <span className={styles.userEmail}>{r.userEmail}</span>
                    </div>
                  </td>
                  <td className={styles.td}>{r.itemName}</td>
                  <td className={styles.td}>{r.dateInfo}</td>
                  <td className={styles.td}>{r.quantity || "-"}</td>
                  <td className={styles.td}>{r.totalPrice ? `${r.totalPrice} €` : t("events.free")}</td>
                  <td className={styles.td}>
                    <span className={statusClass(r.status)}>{t(`status.${r.status.toLowerCase()}`)}</span>
                  </td>
                  <td className={styles.td}>
                    {r.paid ? (
                      <span className={styles.paidBadge}>{t("admin.paid")}</span>
                    ) : r.totalPrice > 0 ? (
                      <span className={styles.unpaidBadge}>{t("admin.unpaid")}</span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className={styles.td}>{new Date(r.createdAt).toLocaleDateString("fr-BE")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className={styles.resultCount}>
        {filteredReservations.length} / {reservations.length} {t("admin.reservationsShown")}
      </p>
    </div>
  );
}
