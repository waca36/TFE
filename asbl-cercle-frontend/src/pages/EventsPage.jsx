import { useEffect, useState } from "react";
import { getPublicEvents } from "../services/api";
import { useTranslation } from "react-i18next";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    getPublicEvents()
      .then(setEvents)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>{t('events.title')}</h1>
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

          {ev.capacity && <p>{t('common.capacity')} : {ev.capacity} {t('common.persons')}</p>}
          {ev.price && <p>{t('common.price')} : {ev.price} €</p>}
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
};
