import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  adminCreateEspace,
  adminGetEspace,
  adminUpdateEspace,
} from "../services/api";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AdminEspaceForm() {
  const { user, token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isEditMode = !!id;

  const [form, setForm] = useState({
    name: "",
    type: "SALLE",
    capacity: 0,
    basePrice: 0,
    status: "AVAILABLE",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }

    if (isEditMode) {
      adminGetEspace(id, token)
        .then((e) =>
          setForm({
            name: e.name || "",
            type: e.type || "",
            capacity: e.capacity || 0,
            basePrice: e.basePrice || 0,
            status: e.status || "AVAILABLE",
          })
        )
        .catch((err) => setError(err.message));
    }
  }, [user, token, id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "capacity" || name === "basePrice"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isEditMode) {
        await adminUpdateEspace(id, form, token);
      } else {
        await adminCreateEspace(form, token);
      }
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        {isEditMode ? t('admin.editSpace') : t('admin.createSpace')}
      </h1>

      <p><Link to="/admin">← {t('admin.backToDashboard')}</Link></p>

      {error && <p style={styles.error}>{error}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>{t('admin.name')} :</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>{t('common.type')} :</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            style={styles.select}
            required
          >
            <option value="SALLE">{t('spaceType.salle')}</option>
            <option value="AUDITOIRE">{t('spaceType.auditoire')}</option>
          </select>
          {form.type === "AUDITOIRE" && (
            <p style={styles.infoText}>
              {t('spaces.auditoriumRequiresApproval')}
            </p>
          )}
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('common.capacity')} :</label>
            <input
              name="capacity"
              type="number"
              value={form.capacity}
              onChange={handleChange}
              min="0"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>{t('admin.basePrice')} (€) :</label>
            <input
              name="basePrice"
              type="number"
              value={form.basePrice}
              onChange={handleChange}
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
            <option value="AVAILABLE">{t('status.available')}</option>
            <option value="UNAVAILABLE">{t('status.unavailable')}</option>
          </select>
        </div>

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => navigate("/admin")}
            style={styles.cancelButton}
          >
            {t('common.cancel')}
          </button>
          <button type="submit" style={styles.submitButton}>
            {isEditMode ? t('common.save') : t('common.create')}
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
  select: {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  infoText: {
    marginTop: "0.5rem",
    fontSize: "0.875rem",
    color: "#f59e0b",
    fontStyle: "italic",
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
