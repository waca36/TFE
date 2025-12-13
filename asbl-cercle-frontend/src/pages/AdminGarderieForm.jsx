import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  adminGetGarderieSession,
  adminCreateGarderieSession,
  adminUpdateGarderieSession,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import styles from "./AdminGarderieForm.module.css";

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

    if (!form.description || form.description.trim().length < 10) {
      setError(t('validation.descriptionRequired') || "Description requise (10 caractères minimum)");
      return;
    }

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

  if (loading) return <p className={styles.info}>{t('common.loading')}</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {isEdit ? t('admin.editSession') : t('admin.newSession')}
      </h1>

      <p>
        <Link to="/admin/garderie">← {t('admin.backToList')}</Link>
      </p>

      {error && <p className={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t('common.title')} :</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>{t('common.description')} :</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            minLength={10}
            required
            className={styles.textarea}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>{t('common.date')} :</label>
          <input
            type="date"
            name="sessionDate"
            value={form.sessionDate}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('reservation.startTime')} :</label>
            <input
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('reservation.endTime')} :</label>
            <input
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('common.capacity')} :</label>
            <input
              type="number"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              required
              min="1"
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('childcare.pricePerChild')} (€) :</label>
            <input
              type="number"
              name="pricePerChild"
              value={form.pricePerChild}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>{t('common.status')} :</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="OPEN">{t('status.open')}</option>
            <option value="CLOSED">{t('status.closed')}</option>
            <option value="CANCELLED">{t('status.cancelled')}</option>
          </select>
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => navigate("/admin/garderie")}
            className={styles.cancelButton}
          >
            {t('common.cancel')}
          </button>
          <button type="submit" className={styles.submitButton}>
            {isEdit ? t('common.save') : t('common.create')}
          </button>
        </div>
      </form>
    </div>
  );
}
