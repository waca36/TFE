import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { organizerCreateEvent, organizerGetMyEvent, organizerUpdateMyEvent } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import styles from "./OrganizerEventForm.module.css";

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
    garderieRequired: false,
    garderiePrice: "",
    garderieCapacity: "",
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
            garderieRequired: event.garderieRequired || false,
            garderiePrice: event.garderiePrice ?? "",
            garderieCapacity: event.garderieCapacity ?? "",
          });
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoadingEvent(false));
    }
  }, [id, isEdit, user, token, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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
      garderiePrice: form.garderiePrice !== "" ? parseFloat(form.garderiePrice) : null,
      garderieCapacity: form.garderieCapacity !== "" ? parseInt(form.garderieCapacity) : null,
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
  if (loadingEvent) return <div className={styles.loading}>{t("common.loading")}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link to="/organizer/events" className={styles.breadcrumbLink}>
          ← {t("organizer.backToMyEvents")}
        </Link>
      </div>

      <div className={styles.formContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>{isEdit ? t("organizer.editEvent") : t("organizer.createEvent")}</h1>
          {!isEdit && <p className={styles.subtitle}>{t("organizer.createEventDesc")}</p>}
        </div>

        {!isEdit && (
          <div className={styles.infoBox}>
            <div className={styles.infoIcon}>ℹ</div>
            <div>
              <strong>{t("organizer.note")}:</strong>
              <p className={styles.infoText}>{t("organizer.pendingApprovalNote")}</p>
            </div>
          </div>
        )}

        {isEdit && originalEvent?.status === "REJECTED" && originalEvent?.rejectionReason && (
          <div className={styles.rejectionBox}>
            <div className={styles.rejectionIcon}>!</div>
            <div>
              <strong>{t("organizer.eventRejected")}</strong>
              <p className={styles.rejectionText}>{originalEvent.rejectionReason}</p>
              <p className={styles.rejectionHint}>{t("organizer.modifyAndResubmit")}</p>
            </div>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              {t("common.title")} <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder={t("organizer.titlePlaceholder")}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t("common.description")}</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder={t("organizer.descriptionPlaceholder")}
              rows={4}
              className={styles.textarea}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                {t("events.startDate")} <span className={styles.required}>*</span>
              </label>
              <input
                type="datetime-local"
                name="startDateTime"
                value={form.startDateTime}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                {t("events.endDate")} <span className={styles.required}>*</span>
              </label>
              <input
                type="datetime-local"
                name="endDateTime"
                value={form.endDateTime}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t("events.location")}</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder={t("organizer.locationPlaceholder")}
              className={styles.input}
            />
            <span className={styles.hint}>{t("organizer.locationHint")}</span>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                {t("common.capacity")} <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                min="1"
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t("common.price")} (€)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={styles.input}
              />
              <span className={styles.hint}>{t("organizer.priceHint")}</span>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.checkboxRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="garderieRequired"
                checked={form.garderieRequired}
                onChange={handleChange}
              />
              <span>{t("organizer.childcareRequired")}</span>
            </label>
          </div>

          {form.garderieRequired && (
            <div className={styles.garderieGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("organizer.childcarePrice")}</label>
                <input
                  type="number"
                  name="garderiePrice"
                  value={form.garderiePrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>{t("organizer.childcareCapacity")}</label>
                <input
                  type="number"
                  name="garderieCapacity"
                  value={form.garderieCapacity}
                  onChange={handleChange}
                  min="1"
                  className={styles.input}
                />
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" onClick={() => navigate("/organizer/events")} className={styles.cancelBtn}>
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`${styles.submitBtn} ${loading ? styles.submitBtnDisabled : ""}`}
            >
              {loading
                ? t("common.loading")
                : isEdit
                ? t("organizer.saveChanges")
                : t("organizer.submitForApproval")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
