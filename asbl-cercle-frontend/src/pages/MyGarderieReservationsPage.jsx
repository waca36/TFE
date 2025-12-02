import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyGarderieReservations } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function MyGarderieReservationsPage() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    getMyGarderieReservations(token)
      .then(setReservations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p>{t('common.loading')}</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>{t('childcare.myReservations')}</h1>

      <p>
        <Link to="/garderie">← {t('childcare.backToSessions')}</Link>
      </p>

      {reservations.length === 0 ? (
        <p>{t('childcare.noReservations')}</p>
      ) : (
        <table border="1" cellPadding="10" style={styles.table}>
          <thead>
            <tr>
              <th>{t('childcare.session')}</th>
              <th>{t('common.date')}</th>
              <th>{t('common.time')}</th>
              <th>{t('common.children')}</th>
              <th>{t('common.total')}</th>
              <th>{t('common.status')}</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id}>
                <td>{r.sessionTitle}</td>
                <td>{r.sessionDate}</td>
                <td>{r.startTime} - {r.endTime}</td>
                <td>{r.numberOfChildren}</td>
                <td>{r.totalPrice} €</td>
                <td>{t(`status.${r.status.toLowerCase()}`)}</td>
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
