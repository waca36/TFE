import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  adminGetGarderieSessions,
  adminCreateGarderieSession,
  adminUpdateGarderieSession,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AdminGarderieForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    description: "",
    sessionDate: "",
    startTime: "",
    endTime: "",
    capacity: 10,
    pricePerChild: 0,
    status: "OPEN",
  });

  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      adminGetGarderieSessions(token)
        .then((sessions) => {
          const found = sessions.find((s) => s.id === parseInt(id));
          if (found) {
            setForm({
              title: found.title || "",
              description: found.description || "",
              sessionDate: found.sessionDate || "",
              startTime: found.startTime || "",
              endTime: found.endTime || "",
              capacity: found.capacity || 10,
              pricePerChild: found.pricePerChild || 0,
              status: found.status || "OPEN",
            });
          } else {
            setError("Session introuvable");
          }
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      ...form,
      capacity: parseInt(form.capacity),
      pricePerChild: parseFloat(form.pricePerChild),
    };

    try {
      if (isEdit) {
        await adminUpdateGarderieSession(id, payload, token);
      } else {
        await adminCreateGarderieSession(payload, token);
      }
      navigate("/admin/garderie");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      <h1>{isEdit ? "Modifier la session" : "Nouvelle session garderie"}</h1>

      <p>
        <Link to="/admin/garderie">← Retour à la liste</Link>
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label>Titre :</label><br />
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Description :</label><br />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Date :</label><br />
          <input
            type="date"
            name="sessionDate"
            value={form.sessionDate}
            onChange={handleChange}
            required
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label>Heure début :</label><br />
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Heure fin :</label><br />
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              required
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
          <div style={{ flex: 1 }}>
            <label>Capacité :</label><br />
            <input
              type="number"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              min="1"
              required
              style={{ width: "100%" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Prix/enfant (€) :</label><br />
            <input
              type="number"
              name="pricePerChild"
              value={form.pricePerChild}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Statut :</label><br />
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            style={{ width: "100%" }}
          >
            <option value="OPEN">OPEN</option>
            <option value="FULL">FULL</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Enregistrement..." : isEdit ? "Modifier" : "Créer"}
        </button>
      </form>
    </div>
  );
}