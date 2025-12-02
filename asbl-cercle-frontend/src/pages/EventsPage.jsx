import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicEvents } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    getPublicEvents()
      .then(setEvents)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>{t('events.title')}</h1>
      
      {user && (
        <p>
          <Link to="/events/my">📋 {t('events.viewMyRegistrations')}</Link>
        </p>
      )}
      
      <hr />

      {events.length === 0 && <p>{t('events.noEvents')}</p>}

      {events.map((ev) => (
        <div key={ev.id} style={styles.card}>
          <h2>{ev.title}</h2>
          <p>{ev.description}</p>

          <p>
            {t('common.from')} <b>{ev.startDateTime.replace("T", " ")}</b><br />
            {t('common.to')} <b>{ev.endDateTime.replace("T", " ")}</b>
          </p>

          {ev.capacity && (
            <p>
              {t('common.capacity')} : {ev.capacity} {t('common.persons')}
              {ev.availablePlaces !== undefined && (
                <span> ({ev.availablePlaces} {t('events.placesAvailable')})</span>
              )}
            </p>
          )}
          
          {ev.price ? (
            <p>{t('common.price')} : {ev.price} €</p>
          ) : (
            <p>{t('events.free')}</p>
          )}

          <div style={styles.actions}>
            {user ? (
              <Link to={`/events/register/${ev.id}`} style={styles.button}>
                {t('events.register')}
              </Link>
            ) : (
              <Link to="/login" style={styles.buttonSecondary}>
                {t('events.loginToRegister')}
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  actions: {
    marginTop: "1rem",
  },
  button: {
    display: "inline-block",
    padding: "0.6rem 1.2rem",
    background: "#2563eb",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
    fontWeight: "500",
  },
  buttonSecondary: {
    display: "inline-block",
    padding: "0.6rem 1.2rem",
    background: "#6b7280",
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
  },
};
