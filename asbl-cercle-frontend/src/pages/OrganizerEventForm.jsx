import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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
  const [originalEvent, setOriginalEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(isEdit);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user || (user.role !== "ORGANIZER" && user.role !== "ADMIN")) {
      navigate("/login");
      return;
    }

    if (isEdit) {
      setLoadingEvent(true);
      organizerGetMyEvent(id, token)
        .then((event) => {
          setOriginalEvent(event);
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
        .catch((err) => setError(err.message))
        .finally(() => setLoadingEvent(false));
    }
  }, [id, isEdit, user, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateForm = () => {
    if (!form.title.trim()) {
      setError(t("validation.titleRequired"));
      return false;
    }
    if (!form.startDateTime) {
      setError(t("validation.startDateRequired"));
      return false;
    }
    if (!form.endDateTime) {
      setError(t("validation.endDateRequired"));
      return false;
    }
    if (new Date(form.startDateTime) < new Date()) {
      setError(t("validation.startDatePast"));
      return false;
    }
    if (new Date(form.endDateTime) <= new Date(form.startDateTime)) {
      setError(t("validation.endBeforeStart"));
      return false;
    }
    if (!form.capacity || parseInt(form.capacity) < 1) {
      setError(t("validation.capacityRequired"));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

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
      setTimeout(() => navigate("/organizer/events"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== "ORGANIZER" && user.role !== "ADMIN")) return null;
  if (loadingEvent) return <div style={styles.loading}>{t("common.loading")}</div>;

  return (
    <div style={styles.container}>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <Link to="/organizer/events" style={styles.breadcrumbLink}>
          ← {t("organizer.backToMyEvents")}
        </Link>
      </div>

      <div style={styles.formContainer}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            {isEdit ? t("organizer.editEvent") : t("organizer.createEvent")}
          </h1>
          {!isEdit && (
            <p style={styles.subtitle}>{t("organizer.createEventDesc")}</p>
          )}
        </div>

        {/* Info Box for new events */}
        {!isEdit && (
          <div style={styles.infoBox}>
            <div style={styles.infoIcon}>ℹ️</div>
            <div>
              <strong>{t("organizer.note")}:</strong>
              <p style={styles.infoText}>{t("organizer.pendingApprovalNote")}</p>
            </div>
          </div>
        )}

        {/* Rejection reason for rejected events */}
        {isEdit && originalEvent?.status === "REJECTED" && originalEvent?.rejectionReason && (
          <div style={styles.rejectionBox}>
            <div style={styles.rejectionIcon}>⚠️</div>
            <div>
              <strong>{t("organizer.eventRejected")}</strong>
              <p style={styles.rejectionText}>{originalEvent.rejectionReason}</p>
              <p style={styles.rejectionHint}>{t("organizer.modifyAndResubmit")}</p>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Title */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              {t("common.title")} <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder={t("organizer.titlePlaceholder")}
              style={styles.input}
              required
            />
          </div>

          {/* Description */}
          <div style={styles.formGroup}>
            <label style={styles.label}>{t("common.description")}</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder={t("organizer.descriptionPlaceholder")}
              rows={4}
              style={styles.textarea}
            />
          </div>

          {/* Date/Time Row */}
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                {t("events.startDate")} <span style={styles.required}>*</span>
              </label>
              <input
                type="datetime-local"
                name="startDateTime"
                value={form.startDateTime}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                {t("events.endDate")} <span style={styles.required}>*</span>
              </label>
              <input
                type="datetime-local"
                name="endDateTime"
                value={form.endDateTime}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>
          </div>

          {/* Location */}
          <div style={styles.formGroup}>
            <label style={styles.label}>{t("events.location")}</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder={t("organizer.locationPlaceholder")}
              style={styles.input}
            />
          </div>

          {/* Capacity & Price Row */}
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                {t("common.capacity")} <span style={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                placeholder="50"
                min="1"
                style={styles.input}
                required
              />
              <span style={styles.hint}>{t("organizer.capacityHint")}</span>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>{t("common.price")} (€)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                style={styles.input}
              />
              <span style={styles.hint}>{t("organizer.priceHint")}</span>
            </div>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button 
              type="button" 
              onClick={() => navigate("/organizer/events")} 
              style={styles.cancelBtn}
            >
              {t("common.cancel")}
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              style={{
                ...styles.submitBtn,
                ...(loading ? styles.submitBtnDisabled : {})
              }}
            >
              {loading 
                ? t("common.loading") 
                : isEdit 
                  ? t("organizer.saveChanges")
                  : t("organizer.submitForApproval")
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "1rem",
  },
  loading: {
    textAlign: "center",
    padding: "3rem",
    color: "#6b7280",
  },
  breadcrumb: {
    marginBottom: "1.5rem",
  },
  breadcrumbLink: {
    color: "#6366f1",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  formContainer: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
    overflow: "hidden",
  },
  header: {
    padding: "2rem 2rem 1rem",
    borderBottom: "1px solid #f3f4f6",
  },
  title: {
    margin: 0,
    fontSize: "1.5rem",
    color: "#111827",
  },
  subtitle: {
    margin: "0.5rem 0 0 0",
    color: "#6b7280",
    fontSize: "0.95rem",
  },
  infoBox: {
    display: "flex",
    gap: "1rem",
    margin: "1.5rem 2rem 0",
    padding: "1rem",
    background: "#fef3c7",
    borderRadius: "10px",
    border: "1px solid #fcd34d",
  },
  infoIcon: {
    fontSize: "1.5rem",
  },
  infoText: {
    margin: "0.25rem 0 0 0",
    color: "#92400e",
    fontSize: "0.9rem",
  },
  rejectionBox: {
    display: "flex",
    gap: "1rem",
    margin: "1.5rem 2rem 0",
    padding: "1rem",
    background: "#fef2f2",
    borderRadius: "10px",
    border: "1px solid #fecaca",
  },
  rejectionIcon: {
    fontSize: "1.5rem",
  },
  rejectionText: {
    margin: "0.25rem 0",
    color: "#991b1b",
    fontSize: "0.9rem",
  },
  rejectionHint: {
    margin: 0,
    color: "#b91c1c",
    fontSize: "0.85rem",
    fontStyle: "italic",
  },
  error: {
    margin: "1.5rem 2rem 0",
    padding: "1rem",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: "8px",
    fontSize: "0.9rem",
  },
  success: {
    margin: "1.5rem 2rem 0",
    padding: "1rem",
    background: "#d1fae5",
    color: "#065f46",
    borderRadius: "8px",
    fontSize: "0.9rem",
  },
  form: {
    padding: "1.5rem 2rem 2rem",
  },
  formGroup: {
    marginBottom: "1.25rem",
    flex: 1,
  },
  row: {
    display: "flex",
    gap: "1.5rem",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "500",
    color: "#374151",
    fontSize: "0.9rem",
  },
  required: {
    color: "#ef4444",
  },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "1rem",
    transition: "border-color 0.2s, box-shadow 0.2s",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "1rem",
    resize: "vertical",
    minHeight: "100px",
    outline: "none",
    boxSizing: "border-box",
  },
  hint: {
    display: "block",
    marginTop: "0.35rem",
    fontSize: "0.8rem",
    color: "#9ca3af",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    marginTop: "2rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid #f3f4f6",
  },
  cancelBtn: {
    padding: "0.75rem 1.5rem",
    background: "#f3f4f6",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    color: "#374151",
    transition: "background 0.2s",
  },
  submitBtn: {
    padding: "0.75rem 2rem",
    background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    boxShadow: "0 4px 6px rgba(139, 92, 246, 0.25)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  submitBtnDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
};
