import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getEspaceReservationsForCalendar } from "../services/api";

export default function DayTimeSlots({
  espaceId,
  selectedDate,
  onSelectTimeSlot,
  selectedStartTime,
  selectedEndTime,
}) {
  const { t } = useTranslation();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

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
    const hourEnd = new Date(`${selectedDate}T${String(hour).padStart(2, "0")}:59:59`);

    const isReserved = reservations.some((r) => {
      const start = new Date(r.startDateTime);
      const end = new Date(r.endDateTime);
      return start < hourEnd && end > hourStart;
    });

    return isReserved ? "reserved" : "available";
  };

  const handleHourClick = (hour) => {
    const status = getHourStatus(hour);
    if (status === "reserved") return;

    const timeStr = `${String(hour).padStart(2, "0")}:00`;
    onSelectTimeSlot(timeStr);
  };

  const isInSelectedRange = (hour) => {
    if (!selectedStartTime || !selectedEndTime) return false;

    const startHour = parseInt(selectedStartTime.split(":")[0]);
    const endHour = parseInt(selectedEndTime.split(":")[0]);

    return hour >= startHour && hour < endHour;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!selectedDate) {
    return (
      <div style={styles.container}>
        <p style={styles.placeholder}>{t("calendar.selectDayFirst")}</p>
      </div>
    );
  }

  // Heures d'ouverture : 7h à 22h
  const OPENING_HOUR = 7;
  const CLOSING_HOUR = 22;

  const hours = [];
  for (let h = OPENING_HOUR; h < CLOSING_HOUR; h++) {
    hours.push(h);
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>{formatDate(selectedDate)}</h3>
      <p style={styles.openingHours}>{t("calendar.openingHours")}</p>

      {loading && <p style={styles.loading}>{t("common.loading")}</p>}

      <div style={styles.slotsContainer}>
        {hours.map((hour) => {
          const status = getHourStatus(hour);
          const isSelected = isInSelectedRange(hour);

          let bgColor = "#22c55e";
          if (status === "reserved") bgColor = "#ef4444";
          if (isSelected) bgColor = "#2563eb";

          return (
            <div
              key={hour}
              onClick={() => handleHourClick(hour)}
              style={{
                ...styles.slot,
                backgroundColor: bgColor,
                cursor: status === "reserved" ? "not-allowed" : "pointer",
                opacity: status === "reserved" ? 0.8 : 1,
              }}
            >
              <span style={styles.hourLabel}>
                {String(hour).padStart(2, "0")}:00 - {String(hour + 1).padStart(2, "0")}:00
              </span>
              {status === "reserved" && (
                <span style={styles.reservedLabel}>{t("calendar.reserved")}</span>
              )}
            </div>
          );
        })}
      </div>

      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendColor, backgroundColor: "#22c55e" }}></span>
          {t("calendar.available")}
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendColor, backgroundColor: "#ef4444" }}></span>
          {t("calendar.reserved")}
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendColor, backgroundColor: "#2563eb" }}></span>
          {t("calendar.selected")}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#fff",
    borderRadius: "8px",
    padding: "1rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "0.25rem",
    textTransform: "capitalize",
  },
  openingHours: {
    fontSize: "0.85rem",
    color: "#6b7280",
    marginBottom: "1rem",
  },
  placeholder: {
    color: "#6b7280",
    textAlign: "center",
    padding: "2rem",
  },
  loading: {
    textAlign: "center",
    color: "#6b7280",
    padding: "1rem",
  },
  slotsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "8px",
    maxHeight: "400px",
    overflowY: "auto",
  },
  slot: {
    padding: "0.75rem 0.5rem",
    borderRadius: "6px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    transition: "transform 0.1s",
  },
  hourLabel: {
    color: "#fff",
    fontSize: "0.85rem",
    fontWeight: "500",
  },
  reservedLabel: {
    color: "#fff",
    fontSize: "0.7rem",
    opacity: 0.9,
  },
  legend: {
    display: "flex",
    justifyContent: "center",
    gap: "1.5rem",
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid #e5e7eb",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.85rem",
    color: "#4b5563",
  },
  legendColor: {
    width: "16px",
    height: "16px",
    borderRadius: "4px",
    display: "inline-block",
  },
};
