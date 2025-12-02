import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminGetGarderieSessions, adminDeleteGarderieSession } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

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
    if (!window.confirm(t('admin.confirmDeleteSession'))) return;
    try {
      await adminDeleteGarderieSession(id, token);
      fetchSessions();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>{t('common.loading')}</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>{t('admin.childcareManagement')}</h1>

      <p>
        <Link to="/admin">← {t('admin.backToDashboard')}</Link>
        {" | "}
        <Link to="/admin/garderie/new">+ {t('admin.createSession')}</Link>
      </p>

      {sessions.length === 0 ? (
        <p>{t('admin.noSessions')}</p>
      ) : (
        <table border="1" cellPadding="10" style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('common.title')}</th>
              <th>{t('common.date')}</th>
              <th>{t('common.time')}</th>
              <th>{t('common.capacity')}</th>
              <th>{t('common.price')}</th>
              <th>{t('common.status')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.title}</td>
                <td>{s.sessionDate}</td>
                <td>{s.startTime} - {s.endTime}</td>
                <td>{s.capacity}</td>
                <td>{s.pricePerChild} €</td>
                <td>{t(`status.${s.status.toLowerCase()}`)}</td>
                <td>
                  <Link to={`/admin/garderie/edit/${s.id}`}>{t('common.edit')}</Link>
                  {" | "}
                  <button onClick={() => handleDelete(s.id)}>{t('common.delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  table: {
    borderCollapse: "collapse",
    width: "100%",
    background: "#fff",
  },
};
