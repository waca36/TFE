import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getEspaceReservationsForCalendar } from "../services/api";

export default function ReservationCalendar({ espaceId, onSelectDate, selectedDate }) {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    if (!espaceId) return;

    setLoading(true);
    getEspaceReservationsForCalendar(espaceId, year, month)
      .then(setReservations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [espaceId, year, month]);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month - 1, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  // Heures d'ouverture : 7h à 22h
  const OPENING_HOUR = 7;
  const CLOSING_HOUR = 22;

  const getDayStatus = (day) => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayStart = new Date(`${dateStr}T${String(OPENING_HOUR).padStart(2, "0")}:00:00`);
    const dayEnd = new Date(`${dateStr}T${String(CLOSING_HOUR).padStart(2, "0")}:00:00`);

    const dayReservations = reservations.filter((r) => {
      const start = new Date(r.startDateTime);
      const end = new Date(r.endDateTime);
      return start < dayEnd && end > dayStart;
    });

    if (dayReservations.length === 0) {
      return "available";
    }

    let totalReservedMinutes = 0;
    const totalOpenMinutes = (CLOSING_HOUR - OPENING_HOUR) * 60;

    dayReservations.forEach((r) => {
      const start = new Date(r.startDateTime);
      const end = new Date(r.endDateTime);

      const effectiveStart = start < dayStart ? dayStart : start;
      const effectiveEnd = end > dayEnd ? dayEnd : end;

      const minutes = (effectiveEnd - effectiveStart) / (1000 * 60);
      totalReservedMinutes += minutes;
    });

    if (totalReservedMinutes >= totalOpenMinutes * 0.9) {
      return "full";
    } else if (totalReservedMinutes > 0) {
      return "partial";
    }
    return "available";
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const handleDayClick = (day) => {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onSelectDate(dateStr);
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const weekDays = [
    t("calendar.mon"),
    t("calendar.tue"),
    t("calendar.wed"),
    t("calendar.thu"),
    t("calendar.fri"),
    t("calendar.sat"),
    t("calendar.sun"),
  ];

  const monthNames = [
    t("calendar.january"),
    t("calendar.february"),
    t("calendar.march"),
    t("calendar.april"),
    t("calendar.may"),
    t("calendar.june"),
    t("calendar.july"),
    t("calendar.august"),
    t("calendar.september"),
    t("calendar.october"),
    t("calendar.november"),
    t("calendar.december"),
  ];

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} style={styles.emptyDay}></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const status = getDayStatus(day);
    const isSelected = selectedDate === dateStr;
    const isToday = dateStr === todayStr;
    const isPast = new Date(dateStr) < new Date(todayStr);

    let bgColor = "#22c55e";
    if (status === "partial") bgColor = "#f97316";
    if (status === "full") bgColor = "#ef4444";
    if (isPast) bgColor = "#d1d5db";

    days.push(
      <div
        key={day}
        onClick={() => !isPast && handleDayClick(day)}
        style={{
          ...styles.day,
          backgroundColor: bgColor,
          cursor: isPast ? "not-allowed" : "pointer",
          opacity: isPast ? 0.5 : 1,
          border: isSelected ? "3px solid #1f2937" : isToday ? "2px solid #2563eb" : "none",
          fontWeight: isToday ? "bold" : "normal",
        }}
      >
        {day}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button type="button" onClick={handlePrevMonth} style={styles.navButton}>
          ←
        </button>
        <span style={styles.monthYear}>
          {monthNames[month - 1]} {year}
        </span>
        <button type="button" onClick={handleNextMonth} style={styles.navButton}>
          →
        </button>
      </div>

      {loading && <p style={styles.loading}>{t("common.loading")}</p>}

      <div style={styles.weekDays}>
        {weekDays.map((d) => (
          <div key={d} style={styles.weekDay}>
            {d}
          </div>
        ))}
      </div>

      <div style={styles.daysGrid}>{days}</div>

      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendColor, backgroundColor: "#22c55e" }}></span>
          {t("calendar.available")}
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendColor, backgroundColor: "#f97316" }}></span>
          {t("calendar.partial")}
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.legendColor, backgroundColor: "#ef4444" }}></span>
          {t("calendar.full")}
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  navButton: {
    background: "#f3f4f6",
    border: "none",
    borderRadius: "6px",
    padding: "0.5rem 1rem",
    fontSize: "1.2rem",
    cursor: "pointer",
  },
  monthYear: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#1f2937",
  },
  loading: {
    textAlign: "center",
    color: "#6b7280",
    padding: "1rem",
  },
  weekDays: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px",
    marginBottom: "4px",
  },
  weekDay: {
    textAlign: "center",
    fontWeight: "600",
    color: "#6b7280",
    fontSize: "0.85rem",
    padding: "0.5rem 0",
  },
  daysGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px",
  },
  emptyDay: {
    aspectRatio: "1",
  },
  day: {
    aspectRatio: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "0.9rem",
    transition: "transform 0.1s",
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
