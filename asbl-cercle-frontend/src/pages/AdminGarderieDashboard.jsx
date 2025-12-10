import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminGetGarderieSessions, adminDeleteGarderieSession } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import styles from "./AdminGarderieDashboard.module.css";

export default function AdminGarderieDashboard() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const fetchSessions = () => {
    setLoading(true);
    adminGetGarderieSessions(token)
      .then(setSessions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSessions();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm(t("admin.confirmDeleteSession"))) return;
    try {
      await adminDeleteGarderieSession(id, token);
      fetchSessions();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p className={styles.info}>{t("common.loading")}</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("admin.childcareManagement")}</h1>
        <div className={styles.links}>
          <Link to="/admin" className={styles.linkGhost}>
            ← {t("admin.backToDashboard")}
          </Link>
          <Link to="/admin/garderie/new" className={styles.primaryLink}>
            + {t("admin.createSession")}
          </Link>
        </div>
      </div>

      {sessions.length === 0 ? (
        <p className={styles.info}>{t("admin.noSessions")}</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>{t("common.title")}</th>
              <th>{t("common.date")}</th>
              <th>{t("common.time")}</th>
              <th>{t("common.capacity")}</th>
              <th>{t("common.price")}</th>
              <th>{t("common.status")}</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.title}</td>
                <td>{s.sessionDate}</td>
                <td>
                  {s.startTime} - {s.endTime}
                </td>
                <td>{s.capacity}</td>
                <td>{s.pricePerChild} €</td>
                <td>{t(`status.${s.status.toLowerCase()}`)}</td>
                <td>
                  <Link to={`/admin/garderie/edit/${s.id}`} className={styles.linkGhost}>
                    {t("common.edit")}
                  </Link>
                  {" | "}
                  <button onClick={() => handleDelete(s.id)} className={styles.btnDanger}>
                    {t("common.delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
