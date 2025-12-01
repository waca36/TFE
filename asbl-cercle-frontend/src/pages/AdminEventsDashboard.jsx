import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  adminGetEvents,
  adminDeleteEvent,
} from "../services/api";
import { Link, useNavigate } from "react-router-dom";

export default function AdminEventsDashboard() {
  const { user, token } = useAuth();
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }

    adminGetEvents(token)
      .then(setEvents)
      .catch(console.error);
  }, [user, token]);

  const del = async (id) => {
    if (!window.confirm("Supprimer cet événement ?")) return;
    await adminDeleteEvent(id, token);
    setEvents(events.filter((e) => e.id !== id));
  };

  return (
    <div>
      <h1>Gestion des événements</h1>
      <Link to="/admin/events/new">+ Créer un événement</Link>
      <hr />

      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Titre</th>
            <th>Date début</th>
            <th>Date fin</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {events.map((ev) => (
            <tr key={ev.id}>
              <td>{ev.title}</td>
              <td>{ev.startDateTime.replace("T", " ")}</td>
              <td>{ev.endDateTime.replace("T", " ")}</td>
              <td>{ev.status}</td>
              <td>
                <Link to={`/admin/events/${ev.id}/edit`}>Modifier</Link>
                {" | "}
                <button onClick={() => del(ev.id)}>Supprimer</button>
              </td>
            </tr>
          ))}

          {events.length === 0 && (
            <tr><td colSpan="5">Aucun événement.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
