import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGarderieSessions } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function GarderiePage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    getGarderieSessions()
      .then(setSessions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>{t('common.loading')}</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>{t('childcare.title')}</h1>
      
      {user && (
        <p>
          <Link to="/garderie/my">📋 {t('childcare.viewMyReservations')}</Link>
        </p>
      )}

      {sessions.length === 0 ? (
        <p>{t('childcare.noSessions')}</p>
      ) : (
        <table border="1" cellPadding="10" style={styles.table}>
          <thead>
            <tr>
              <th>{t('common.title')}</th>
              <th>{t('common.date')}</th>
              <th>{t('common.time')}</th>
              <th>{t('childcare.pricePerChild')}</th>
              <th>{t('childcare.places')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => {
              const isFull = s.availablePlaces !== undefined && s.availablePlaces <= 0;
              
              return (
                <tr key={s.id}>
                  <td>{s.title}</td>
                  <td>{s.sessionDate}</td>
                  <td>{s.startTime} - {s.endTime}</td>
                  <td>{s.pricePerChild} €</td>
                  <td>
                    {s.availablePlaces !== undefined ? (
                      <span style={{ color: isFull ? '#dc2626' : '#059669', fontWeight: '500' }}>
                        {s.availablePlaces} / {s.capacity}
                      </span>
                    ) : (
                      s.capacity
                    )}
                  </td>
                  <td>
                    {user ? (
                      isFull ? (
                        <span style={{ color: '#9ca3af' }}>{t('childcare.full')}</span>
                      ) : (
                        <Link to={`/garderie/reserve/${s.id}`}>{t('childcare.reserve')}</Link>
                      )
                    ) : (
                      <Link to="/login">{t('nav.login')}</Link>
                    )}
                  </td>
                </tr>
              );
            })}
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
