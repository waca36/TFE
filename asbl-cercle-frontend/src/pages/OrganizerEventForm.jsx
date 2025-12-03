import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { organizerCreateEvent, organizerGetMyEvent, organizerUpdateMyEvent } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function OrganizerEventForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form, setForm] = useState({
    title: "",
    description: "",
    startDateTime: "",
    endDateTime: "",
    location: "",
    capacity: "",
    price: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user || (user.role !== "ORGANISATEUR" && user.role !== "ADMIN")) {
      navigate("/login");
      return;
    }

    if (isEdit) {
      organizerGetMyEvent(id, token)
        .then((event) => {
          setForm({
            title: event.title,
            description: event.description || "",
            startDateTime: event.startDateTime.slice(0, 16),
            endDateTime: event.endDateTime.slice(0, 16),
            location: event.location || "",
            capacity: event.capacity,
            price: event.price || "",
          });
        })
        .catch((err) => setError(err.message));
    }
  }, [id, isEdit, user, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const payload = {
      ...form,
      capacity: parseInt(form.capacity),
      price: form.price ? parseFloat(form.price) : 0,
    };

    try {
      if (isEdit) {
        await organizerUpdateMyEvent(id, payload, token);
        setSuccess(t("organizer.eventUpdated"));
      } else {
        await organizerCreateEvent(payload, token);
        setSuccess(t("organizer.eventCreated"));
      }
      setTimeout(() => navigate("/organizer/events"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== "ORGANISATEUR" && user.role !== "ADMIN")) return null;

  return (
    <div style={styles.container}>
      <h1>{isEdit ? t("organizer.editEvent") : t("organizer.createEvent")}</h1>

      {!isEdit && (
        <div style={styles.infoBox}>
          <strong>ℹ️ {t("organizer.note")}:</strong> {t("organizer.pendingApprovalNote")}
        </div>
      )}

      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label>{t("common.title")} *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.field}>
          <label>{t("common.description")}</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            style={styles.textarea}
          />
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label>{t("events.startDate")} *</label>
            <input
              type="datetime-local"
              name="startDateTime"
              value={form.startDateTime}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label>{t("events.endDate")} *</label>
            <input
              type="datetime-local"
              name="endDateTime"
              value={form.endDateTime}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.field}>
          <label>{t("events.location")}</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            style={styles.input}
          />
        </div>

        <div style={styles.row}>
          <div style={styles.field}>
            <label>{t("common.capacity")} *</label>
            <input
              type="number"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              required
              min="1"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label>{t("common.price")} (€)</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder={t("events.freeIfEmpty")}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.actions}>
          <button type="button" onClick={() => navigate("/organizer/events")} style={styles.cancelBtn}>
            {t("common.cancel")}
          </button>
          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? t("common.loading") : isEdit ? t("common.save") : t("organizer.submitForApproval")}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "700px",
    margin: "0 auto",
  },
  infoBox: {
    padding: "1rem",
    background: "#fef3c7",
    borderRadius: "8px",
    marginBottom: "1.5rem",
    color: "#92400e",
  },
  form: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  field: {
    marginBottom: "1rem",
    flex: 1,
  },
  row: {
    display: "flex",
    gap: "1rem",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "1rem",
    marginTop: "0.25rem",
  },
  textarea: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "1rem",
    marginTop: "0.25rem",
    resize: "vertical",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    marginTop: "1.5rem",
  },
  cancelBtn: {
    padding: "0.75rem 1.5rem",
    background: "#f3f4f6",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  submitBtn: {
    padding: "0.75rem 1.5rem",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  error: {
    color: "#dc2626",
    marginBottom: "1rem",
  },
  success: {
    color: "#059669",
    marginBottom: "1rem",
  },
};
