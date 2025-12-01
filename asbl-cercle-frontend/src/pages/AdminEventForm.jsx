import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  adminCreateEvent,
  adminGetEvents,
  adminUpdateEvent,
} from "../services/api";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function AdminEventForm() {
  const { user, token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = !!id;

  const [event, setEvent] = useState({
    title: "",
    description: "",
    startDateTime: "",
    endDateTime: "",
    capacity: "",
    price: "",
    status: "DRAFT",
  });

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }

    if (isEdit) {
      fetch(`http://localhost:8080/api/admin/events`, {
        headers: { Authorization: "Bearer " + token },
      })
        .then((res) => res.json())
        .then((events) => {
          const ev = events.find((e) => e.id === Number(id));
          if (ev) {
            setEvent({
              title: ev.title,
              description: ev.description,
              startDateTime: ev.startDateTime,
              endDateTime: ev.endDateTime,
              capacity: ev.capacity,
              price: ev.price,
              status: ev.status,
            });
          }
        });
    }
  }, [id, isEdit, user, token]);

  const submit = async (e) => {
    e.preventDefault();

    const payload = {
      ...event,
      capacity: event.capacity ? Number(event.capacity) : null,
      price: event.price ? Number(event.price) : null,
    };

    if (isEdit) {
      await adminUpdateEvent(id, payload, token);
    } else {
      await adminCreateEvent(payload, token);
    }

    navigate("/admin/events");
  };

  const handleChange = (e) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h1>{isEdit ? "Modifier" : "Créer"} un événement</h1>

      <p><Link to="/admin/events">← Retour</Link></p>

      <form onSubmit={submit}>
        <label>Titre</label><br />
        <input name="title" value={event.title} onChange={handleChange} /><br />

        <label>Description</label><br />
        <textarea
          name="description"
          value={event.description}
          onChange={handleChange}
        /><br />

        <label>Date début</label><br />
        <input
          type="datetime-local"
          name="startDateTime"
          value={event.startDateTime}
          onChange={handleChange}
        /><br />

        <label>Date fin</label><br />
        <input
          type="datetime-local"
          name="endDateTime"
          value={event.endDateTime}
          onChange={handleChange}
        /><br />

        <label>Capacité (optionnel)</label><br />
        <input
          type="number"
          name="capacity"
          value={event.capacity}
          onChange={handleChange}
        /><br />

        <label>Prix (€) (optionnel)</label><br />
        <input
          type="number"
          name="price"
          value={event.price}
          onChange={handleChange}
        /><br />

        <label>Statut</label><br />
        <select name="status" value={event.status} onChange={handleChange}>
          <option value="DRAFT">DRAFT</option>
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select><br /><br />

        <button type="submit">{isEdit ? "Enregistrer" : "Créer"}</button>
      </form>
    </div>
  );
}
