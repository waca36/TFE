import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyEventRegistrations, cancelEventRegistration } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function MyEventRegistrationsPage() {
  const { token } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const fetchRegistrations = () => {
    setLoading(true);
    getMyEventRegistrations(token)
      .then(setRegistrations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRegistrations();
  }, [token]);

  const handleCancel = async (id) => {
    if (!window.confirm(t('events.confirmCancel'))) return;
    
    try {
      await cancelEventRegistration(id, token);
      fetchRegistrations();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>{t('common.loading')}</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>{t('events.myRegistrations')}</h1>

      <p>
        <Link to="/events">← {t('events.backToEvents')}</Link>
      </p>

      {registrations.length === 0 ? (
        <p>{t('events.noRegistrations')}</p>
      ) : (
        <table border="1" cellPadding="10" style={styles.table}>
          <thead>
            <tr>
              <th>{t('events.event')}</th>
              <th>{t('common.date')}</th>
              <th>{t('events.participants')}</th>
              <th>{t('common.total')}</th>
              <th>{t('common.status')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((r) => {
              const isPast = new Date(r.eventStartDateTime) < new Date();
              const canCancel = !isPast && r.status !== "CANCELLED";
              
              return (
                <tr key={r.id}>
                  <td>{r.eventTitle}</td>
                  <td>{r.eventStartDateTime.replace("T", " ")}</td>
                  <td>{r.numberOfParticipants}</td>
                  <td>{r.totalPrice > 0 ? `${r.totalPrice} €` : t('events.free')}</td>
                  <td>{t(`status.${r.status.toLowerCase()}`)}</td>
                  <td>
                    {canCancel ? (
                      <button 
                        onClick={() => handleCancel(r.id)}
                        style={styles.cancelButton}
                      >
                        {t('events.cancelRegistration')}
                      </button>
                    ) : (
                      <span style={styles.disabledText}>
                        {isPast ? t('events.eventPassed') : "-"}
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
