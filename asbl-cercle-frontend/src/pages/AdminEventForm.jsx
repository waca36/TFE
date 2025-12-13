import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { adminCreateEvent, adminUpdateEvent, adminGetEspaces } from "../services/api";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./AdminEventForm.module.css";

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
    locationType: "EXTERNAL",
    spaceId: "",
    location: "",
    capacity: "",
    price: "",
    garderieRequired: false,
    garderiePrice: "",
    garderieCapacity: "",
    status: "DRAFT",
  });

  const [espaces, setEspaces] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }

    adminGetEspaces(token)
      .then(setEspaces)
      .catch(() => setEspaces([]));

    if (isEdit) {
      fetch("http://localhost:8080/api/admin/events", {
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
              locationType: ev.locationType || (ev.spaceId ? "EXISTING_SPACE" : "EXTERNAL"),
              spaceId: ev.spaceId ?? "",
              location: ev.externalAddress || ev.location || "",
              capacity: ev.capacity || "",
              price: ev.price || "",
              garderieRequired: ev.garderieRequired || false,
              garderiePrice: ev.garderiePrice ?? "",
              garderieCapacity: ev.garderieCapacity ?? "",
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
      return t("reservation.dateError");
    }

    if (startDate < now) {
      return t("validation.startDatePast");
    }

    if (endDate < now) {
      return t("validation.endDatePast");
    }

    if (endDate <= startDate) {
      return t("validation.endBeforeStart");
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

    if (event.locationType === "EXISTING_SPACE" && !event.spaceId) {
      setError(t("admin.spaceRequired") || "Veuillez sélectionner un espace");
      return;
    }

    if (event.locationType === "EXTERNAL" && !event.location.trim()) {
      setError(t("admin.addressRequired") || "Adresse requise");
      return;
    }

    const payload = {
      ...event,
      spaceId: event.spaceId ? Number(event.spaceId) : null,
      capacity: event.capacity ? Number(event.capacity) : null,
      price: event.price ? Number(event.price) : null,
      garderiePrice: event.garderiePrice !== "" ? Number(event.garderiePrice) : null,
      garderieCapacity: event.garderieCapacity !== "" ? Number(event.garderieCapacity) : null,
      externalAddress: event.locationType === "EXTERNAL" ? event.location : null,
    };

    try {
      if (isEdit) {
        await adminUpdateEvent(id, payload, token);
      } else {
        await adminCreateEvent(payload, token);
      }
      navigate("/admin/events");
    } catch (err) {
      setError(err.message || t("common.error"));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEvent({ ...event, [name]: type === "checkbox" ? checked : value });
    setError("");
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{isEdit ? t("admin.editEvent") : t("admin.createEvent")}</h1>

      <p>
        <Link to="/admin/events" className={styles.backLink}>
          ← {t("admin.backToList")}
        </Link>
      </p>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={submit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>{t("common.title")} *</label>
          <input
            name="title"
            value={event.title}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>{t("common.description")} *</label>
          <textarea
            name="description"
            value={event.description}
            onChange={handleChange}
            className={styles.textarea}
            required
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>{t("events.locationType")} *</label>
            <select
              name="locationType"
              value={event.locationType}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="EXTERNAL">{t("events.externalAddress")}</option>
              <option value="EXISTING_SPACE">{t("events.existingSpace")}</option>
            </select>
          </div>

          {event.locationType === "EXISTING_SPACE" ? (
            <div className={styles.field}>
              <label className={styles.label}>{t("spaces.space")}</label>
              <select
                name="spaceId"
                value={event.spaceId}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="">{t("common.select")}</option>
                {espaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className={styles.field}>
              <label className={styles.label}>{t("events.location")} *</label>
              <input
                name="location"
                value={event.location}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          )}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>{t("reservation.startDate")} *</label>
            <input
              type="datetime-local"
              name="startDateTime"
              value={event.startDateTime}
              onChange={handleChange}
              min={getMinDateTime()}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t("reservation.endDate")} *</label>
            <input
              type="datetime-local"
              name="endDateTime"
              value={event.endDateTime}
              onChange={handleChange}
              min={event.startDateTime || getMinDateTime()}
              className={styles.input}
              required
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>{t("common.capacity")}</label>
            <input
              type="number"
              name="capacity"
              value={event.capacity}
              onChange={handleChange}
              min="1"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>{t("common.price")} (€)</label>
            <input
              type="number"
              name="price"
              value={event.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.checkboxRow}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="garderieRequired"
              checked={event.garderieRequired}
              onChange={handleChange}
            />
            <span>{t("organizer.childcareRequired")}</span>
          </label>
        </div>

        {event.garderieRequired && (
          <div className={styles.garderieGrid}>
            <div className={styles.field}>
              <label className={styles.label}>{t("organizer.childcarePrice")}</label>
              <input
                type="number"
                name="garderiePrice"
                value={event.garderiePrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>{t("organizer.childcareCapacity")}</label>
              <input
                type="number"
                name="garderieCapacity"
                value={event.garderieCapacity}
                onChange={handleChange}
                min="1"
                className={styles.input}
              />
            </div>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label}>{t("common.status")} *</label>
          <select
            name="status"
            value={event.status}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="DRAFT">{t("status.draft")}</option>
            <option value="PUBLISHED">{t("status.published")}</option>
            <option value="CANCELLED">{t("status.cancelled")}</option>
          </select>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={() => navigate("/admin/events")} className={styles.secondary}>
            {t("common.cancel")}
          </button>
          <button type="submit" className={styles.primary}>
            {isEdit ? t("common.save") : t("common.create")}
          </button>
        </div>
      </form>
    </div>
  );
}
