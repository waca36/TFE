import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  adminGetGarderieSession,
  adminCreateGarderieSession,
  adminUpdateGarderieSession,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function AdminGarderieForm() {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { t } = useTranslation();

  const [form, setForm] = useState({
    title: "",
    description: "",
    sessionDate: "",
    startTime: "",
    endTime: "",
    capacity: "",
    pricePerChild: "",
    status: "OPEN",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      adminGetGarderieSession(id, token)
        .then((session) => {
          setForm({
            title: session.title || "",
            description: session.description || "",
            sessionDate: session.sessionDate || "",
            startTime: session.startTime || "",
            endTime: session.endTime || "",
            capacity: session.capacity || "",
            pricePerChild: session.pricePerChild || "",
            status: session.status || "OPEN",
          });
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      ...form,
      capacity: Number(form.capacity),
      pricePerChild: Number(form.pricePerChild),
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
    }
  };

  if (loading) return <p>{t('common.loading')}</p>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        {isEdit ? t('admin.editSession') : t('admin.newSession')}
      </h1>

      <p>
        <Link to="/admin/garderie">← {t('admin.backToList')}</Link>
      </p>

      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>{t('common.title')} :</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>{t('common.description')} :</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            style={styles.textarea}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>{t('common.date')} :</label>
          <input
            type="date"
            name="sessionDate"
            value={form.sessionDate}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('reservation.startTime')} :</label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('reservation.endTime')} :</label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('common.capacity')} :</label>
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
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('childcare.pricePerChild')} (€) :</label>
            <input
              type="number"
              name="pricePerChild"
              value={form.pricePerChild}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>{t('common.status')} :</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            style={styles.select}
          >
            <option value="OPEN">{t('status.open')}</option>
            <option value="CLOSED">{t('status.closed')}</option>
            <option value="CANCELLED">{t('status.cancelled')}</option>
          </select>
        </div>

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => navigate("/admin/garderie")}
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
    maxWidth: "500px",
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
