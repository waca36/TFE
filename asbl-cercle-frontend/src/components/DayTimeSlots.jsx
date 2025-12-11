import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getEspaceReservationsForCalendar } from "../services/api";
import styles from "./DayTimeSlots.module.css";

const OPENING_HOUR = 7;
const CLOSING_HOUR = 22;

export default function DayTimeSlots({
  espaceId,
  selectedDate,
  onSelectTimeSlot,
  selectedStartTime,
  selectedEndTime,
}) {
  const { t, i18n } = useTranslation();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  const getDateLocale = () => {
    const locales = { fr: "fr-BE", nl: "nl-BE", en: "en-GB" };
    return locales[i18n.language] || "fr-BE";
  };

  useEffect(() => {
    if (!espaceId || !selectedDate) return;

    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    setLoading(true);
    getEspaceReservationsForCalendar(espaceId, year, month)
      .then(setReservations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [espaceId, selectedDate]);

  const getHourStatus = (hour) => {
    const hourStart = new Date(`${selectedDate}T${String(hour).padStart(2, "0")}:00:00`);
    const hourEnd = new Date(`${selectedDate}T${String(hour + 1).padStart(2, "0")}:00:00`);

    const isReserved = reservations.some((r) => {
      const start = new Date(r.startDateTime);
      const end = new Date(r.endDateTime);
      return start < hourEnd && end > hourStart;
    });

    return isReserved ? "reserved" : "available";
  };

  const isPastHour = (hour) => {
    if (!selectedDate) return false;
    const now = new Date();
    const slotEnd = new Date(`${selectedDate}T${String(hour + 1).padStart(2, "0")}:00:00`);
    const isSameDay = slotEnd.toDateString() === now.toDateString();
    return isSameDay && slotEnd <= now;
  };

  const handleHourClick = (hour) => {
    const status = getHourStatus(hour);
    if (status === "reserved" || isPastHour(hour)) return;

    const timeStr = `${String(hour).padStart(2, "0")}:00`;
    onSelectTimeSlot(timeStr);
  };

  const isStartSelected = (hour) => {
    if (!selectedStartTime) return false;
    const startHour = parseInt(selectedStartTime.split(":")[0]);
    return hour === startHour;
  };

  const isEndSelected = (hour) => {
    if (!selectedEndTime) return false;
    const endHour = parseInt(selectedEndTime.split(":")[0]);
    return hour === endHour;
  };

  const isInSelectedRange = (hour) => {
    if (!selectedStartTime || !selectedEndTime) return false;

    const startHour = parseInt(selectedStartTime.split(":")[0]);
    const endHour = parseInt(selectedEndTime.split(":")[0]);

    return hour > startHour && hour < endHour;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(getDateLocale(), {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!selectedDate) {
    return (
      <div className={styles.container}>
        <p className={styles.placeholder}>{t("calendar.selectDayFirst")}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{formatDate(selectedDate)}</h3>
      <p className={styles.openingHours}>{t("calendar.openingHours")}</p>

      {loading && <p className={styles.loading}>{t("common.loading")}</p>}

      <div className={styles.slotsContainer}>
        {Array.from({ length: CLOSING_HOUR - OPENING_HOUR + 1 }, (_, i) => OPENING_HOUR + i).map((hour) => {
          const status = getHourStatus(hour);
          const isSelected = isStartSelected(hour) || isEndSelected(hour);
          const past = isPastHour(hour);

          const slotClass = [
            styles.slot,
            status === "reserved" ? styles.reserved : styles.available,
            isSelected ? styles.selected : "",
            isInSelectedRange(hour) ? styles.inRange : "",
            past ? styles.past : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div key={hour} className={slotClass} onClick={() => handleHourClick(hour)} aria-disabled={past}>
              <span className={styles.hourLabel}>{String(hour).padStart(2, "0")}:00</span>
              {past && <span className={styles.reservedLabel}>{t("status.unavailable")}</span>}
              {status === "reserved" && <span className={styles.reservedLabel}>{t("calendar.reserved")}</span>}
              {isStartSelected(hour) && <span className={styles.selectionLabel}>{t("calendar.start")}</span>}
              {isEndSelected(hour) && <span className={styles.selectionLabel}>{t("calendar.end")}</span>}
            </div>
          );
        })}
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={`${styles.legendColor} ${styles.legendAvailable}`}></span>
          <span>{t("calendar.available")}</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendColor} ${styles.legendReserved}`}></span>
          <span>{t("calendar.reserved")}</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.legendColor} ${styles.legendSelected}`}></span>
          <span>{t("calendar.selected")}</span>
        </div>
      </div>
    </div>
  );
}
