import { useEffect, useState } from "react";
import { getPublicEvents } from "../services/api";

export default function EventsPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getPublicEvents()
      .then(setEvents)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>Événements à venir</h1>
      <hr />

      {events.length === 0 && <p>Aucun événement pour l’instant.</p>}

      {events.map((ev) => (
        <div key={ev.id} style={{ marginBottom: "1rem" }}>
          <h2>{ev.title}</h2>
          <p>{ev.description}</p>

          <p>
            Du <b>{ev.startDateTime.replace("T", " ")}</b><br />
            Au <b>{ev.endDateTime.replace("T", " ")}</b>
          </p>

          {ev.capacity && <p>Capacité : {ev.capacity} personnes</p>}
          {ev.price && <p>Prix : {ev.price} €</p>}

          <hr />
        </div>
      ))}
    </div>
  );
}
