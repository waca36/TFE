import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyReservations, cancelReservation } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function MyReservationsPage() {
  const { user, token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchReservations = () => {
    if (!user || !token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    getMyReservations(token)
      .then(setReservations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReservations();
  }, [user, token]);

  const handleCancel = async (id) => {
    if (!window.confirm(t('reservation.confirmCancel'))) return;
    
    try {
      await cancelReservation(id, token);
      fetchReservations();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>{t('common.loading')}</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>{t('reservation.myReservations')}</h1>

      <hr />

      {reservations.length === 0 ? (
        <p>{t('reservation.noReservations')}</p>
      ) : (
        <table border="1" cellPadding="10" style={styles.table}>
          <thead>
            <tr>
              <th>{t('spaces.space')}</th>
              <th>{t('reservation.startDate')}</th>
              <th>{t('reservation.endDate')}</th>
              <th>{t('common.total')}</th>
              <th>{t('common.status')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => {
              const isPast = new Date(r.startDateTime) < new Date();
              const canCancel = !isPast && r.status !== "CANCELLED";
              
              return (
                <tr key={r.id}>
                  <td>{r.espaceName || r.espace?.name}</td>
                  <td>{r.startDateTime.replace("T", " ")}</td>
                  <td>{r.endDateTime.replace("T", " ")}</td>
                  <td>{r.totalPrice} €</td>
                  <td>{t(`status.${r.status.toLowerCase()}`)}</td>
                  <td>
                    {canCancel ? (
                      <button 
                        onClick={() => handleCancel(r.id)}
                        style={styles.cancelButton}
                      >
                        {t('reservation.cancel')}
                      </button>
                    ) : (
                      <span style={styles.disabledText}>
                        {isPast ? t('reservation.passed') : "-"}
                      </span>
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
  cancelButton: {
    padding: "0.4rem 0.8rem",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  disabledText: {
    color: "#9ca3af",
    fontSize: "0.85rem",
  },
};
