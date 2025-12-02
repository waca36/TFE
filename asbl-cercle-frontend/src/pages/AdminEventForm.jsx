import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { adminCreateEvent, adminUpdateEvent } from "../services/api";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AdminEventForm() {
  const { user, token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

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

  const [error, setError] = useState("");

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
              capacity: ev.capacity || "",
              price: ev.price || "",
              status: ev.status,
            });
          }
        });
    }
  }, [id, isEdit, user, token, navigate]);

  const validateDates = () => {
    const now = new Date();
    const startDate = new Date(event.startDateTime);
    const endDate = new Date(event.endDateTime);

    if (!event.startDateTime || !event.endDateTime) {
      return t('reservation.dateError');
    }

    if (startDate < now) {
      return t('validation.startDatePast');
    }

    if (endDate < now) {
      return t('validation.endDatePast');
    }

    if (endDate <= startDate) {
      return t('validation.endBeforeStart');
    }

    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    const dateError = validateDates();
    if (dateError) {
      setError(dateError);
      return;
    }

    const payload = {
      ...event,
      capacity: event.capacity ? Number(event.capacity) : null,
      price: event.price ? Number(event.price) : null,
    };

    try {
      if (isEdit) {
        await adminUpdateEvent(id, payload, token);
      } else {
        await adminCreateEvent(payload, token);
      }
      navigate("/admin/events");
    } catch (err) {
      setError(err.message || t('common.error'));
    }
  };

  const handleChange = (e) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
    setError("");
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        {isEdit ? t('admin.editEvent') : t('admin.createEvent')}
      </h1>

      <p><Link to="/admin/events">← {t('admin.backToList')}</Link></p>

      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={submit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>{t('common.title')} *</label>
          <input
            name="title"
            value={event.title}
            onChange={handleChange}
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>{t('common.description')} *</label>
          <textarea
            name="description"
            value={event.description}
            onChange={handleChange}
            style={styles.textarea}
            required
          />
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('reservation.startDate')} *</label>
            <input
              type="datetime-local"
              name="startDateTime"
              value={event.startDateTime}
              onChange={handleChange}
              min={getMinDateTime()}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>{t('reservation.endDate')} *</label>
            <input
              type="datetime-local"
              name="endDateTime"
              value={event.endDateTime}
              onChange={handleChange}
              min={event.startDateTime || getMinDateTime()}
              style={styles.input}
              required
            />
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('common.capacity')}</label>
            <input
              type="number"
              name="capacity"
              value={event.capacity}
              onChange={handleChange}
              min="1"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>{t('common.price')} (€)</label>
            <input
              type="number"
              name="price"
              value={event.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>{t('common.status')} *</label>
          <select
            name="status"
            value={event.status}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="DRAFT">{t('status.draft')}</option>
            <option value="PUBLISHED">{t('status.published')}</option>
            <option value="CANCELLED">{t('status.cancelled')}</option>
          </select>
        </div>

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => navigate("/admin/events")}
            style={styles.cancelButton}
          >
            {t('common.cancel')}
          </button>
          <button type="submit" style={styles.submitButton}>
            {isEdit ? t('common.save') : t('common.create')}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
  },
  title: {
    fontSize: "1.8rem",
    marginBottom: "1rem",
    color: "#1f2937",
  },
  form: {
    background: "#fff",
    borderRadius: "8px",
    padding: "1.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  formGroup: {
    marginBottom: "1rem",
    flex: 1,
  },
  formRow: {
    display: "flex",
    gap: "1rem",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "1rem",
    minHeight: "100px",
    boxSizing: "border-box",
    resize: "vertical",
  },
  select: {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  error: {
    color: "#dc2626",
    background: "#fef2f2",
    padding: "0.75rem",
    borderRadius: "6px",
    marginBottom: "1rem",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    marginTop: "1.5rem",
  },
  cancelButton: {
    flex: 1,
    padding: "0.75rem 1rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    background: "#fff",
    color: "#374151",
    fontSize: "1rem",
    cursor: "pointer",
  },
  submitButton: {
    flex: 1,
    padding: "0.75rem 1rem",
    border: "none",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
  },
};
