import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getEspaces, requestAuditoriumReservation, createReservation } from "../services/api";
import { useTranslation } from "react-i18next";
import PaymentForm from "../components/PaymentForm";
import ReservationCalendar from "../components/ReservationCalendar";
import DayTimeSlots from "../components/DayTimeSlots";

const STRIPE_PUBLIC_KEY = "pk_test_51SZtvU43LA5MMUSyvqwMUBrZfuUUVrERUSNHtXE6j60tCbnIc5DTcaKJO1RlgpjgniuXjsFiIJsyM9jjZizdLxxn008fF3zfDs";

export default function CreateReservationPage() {
  const { espaceId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { t } = useTranslation();

  const [espace, setEspace] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [showPayment, setShowPayment] = useState(false);
  const [creatingReservation, setCreatingReservation] = useState(false);
  const [justification, setJustification] = useState("");

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    getEspaces()
      .then((list) => {
        const found = list.find((e) => String(e.id) === String(espaceId));
        setEspace(found || null);
        if (!found) setError("Espace introuvable");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, token, espaceId, navigate]);

  const calculateTotalPrice = () => {
    if (!espace || !selectedDate || !startTime || !endTime) return espace?.basePrice || 0;

    const start = new Date(`${selectedDate}T${startTime}`);
    const end = new Date(`${selectedDate}T${endTime}`);
    const hours = Math.max(1, (end - start) / (1000 * 60 * 60));

    return espace.basePrice * hours;
  };

  const totalPrice = calculateTotalPrice();

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setStartTime("");
    setEndTime("");
  };

  const handleTimeSlotClick = (time) => {
    if (!startTime) {
      setStartTime(time);
      setEndTime("");
    } else if (!endTime) {
      const startHour = parseInt(startTime.split(":")[0]);
      const clickedHour = parseInt(time.split(":")[0]);

      if (clickedHour > startHour) {
        setEndTime(time);
      } else {
        setStartTime(time);
        setEndTime("");
      }
    } else {
      setStartTime(time);
      setEndTime("");
    }
  };

  const isAuditoire = espace?.type === "AUDITOIRE";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedDate) {
      setError(t("calendar.selectDayFirst"));
      return;
    }

    if (!startTime || !endTime) {
      setError(t("calendar.selectTimeSlots"));
      return;
    }

    const start = new Date(`${selectedDate}T${startTime}`);
    const end = new Date(`${selectedDate}T${endTime}`);

    if (end <= start) {
      setError(t("reservation.dateOrderError"));
      return;
    }

    if (isAuditoire && !justification.trim()) {
      setError(t("reservation.justificationRequired"));
      return;
    }

    if (isAuditoire) {
      await handleAuditoriumRequest();
    } else {
      setShowPayment(true);
    }
  };

  const handleAuditoriumRequest = async () => {
    setCreatingReservation(true);
    setError("");

    const startDateTime = `${selectedDate}T${startTime}:00`;
    const endDateTime = `${selectedDate}T${endTime}:00`;

    try {
      await requestAuditoriumReservation(
        {
          espaceId: Number(espaceId),
          startDateTime,
          endDateTime,
          totalPrice: totalPrice,
          justification: justification,
        },
        token
      );

      alert(t("reservation.pendingApprovalMessage"));
      navigate("/reservations");
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingReservation(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    setCreatingReservation(true);
    setError("");

    const startDateTime = `${selectedDate}T${startTime}:00`;
    const endDateTime = `${selectedDate}T${endTime}:00`;

    try {
      await createReservation(
        {
          espaceId: Number(espaceId),
          startDateTime,
          endDateTime,
          totalPrice: totalPrice,
          paymentIntentId: paymentIntentId,
        },
        token
      );

      alert(t("payment.success"));
      navigate("/reservations");
    } catch (err) {
      setError(err.message);
      setShowPayment(false);
    } finally {
      setCreatingReservation(false);
    }
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  const handleReset = () => {
    setStartTime("");
    setEndTime("");
  };

  if (!user || !token) return null;
  if (loading) return <p>{t("common.loading")}</p>;
  if (error && !espace) return <p style={{ color: "red" }}>{error}</p>;

  if (showPayment) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>{t("payment.title")}</h1>

        {creatingReservation ? (
          <div style={styles.loadingBox}>
            <p>{t("reservation.creating")}</p>
          </div>
        ) : (
          <PaymentForm
            stripePublicKey={STRIPE_PUBLIC_KEY}
            token={token}
            amount={totalPrice}
            description={`${t("reservation.newReservation")}: ${espace.name} - ${selectedDate} ${startTime} ${t("common.to").toLowerCase()} ${endTime}`}
            reservationType="ESPACE"
            metadata={{
              espaceId: Number(espaceId),
            }}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        )}

        {error && <p style={styles.error}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{t("reservation.newReservation")}</h1>

      {espace && (
        <div style={styles.espaceCard}>
          <h2 style={styles.espaceName}>{espace.name}</h2>
          <div style={styles.espaceInfo}>
            <p>
              <strong>{t("common.type")} :</strong> {t(`spaceType.${espace.type.toLowerCase()}`)}
            </p>
            <p>
              <strong>{t("common.capacity")} :</strong> {espace.capacity} {t("common.persons")}
            </p>
            <p>
              <strong>{t("common.price")} :</strong> {espace.basePrice} € {t("common.perHour")}
            </p>
          </div>
          {isAuditoire && (
            <div style={styles.warningBox}>
              <p>{t("reservation.auditoriumWarning")}</p>
            </div>
          )}
        </div>
      )}

      <div style={styles.calendarSection}>
        <h3 style={styles.sectionTitle}>{t("calendar.selectDate")}</h3>
        <ReservationCalendar espaceId={Number(espaceId)} onSelectDate={handleDateSelect} selectedDate={selectedDate} />
      </div>

      {selectedDate && (
        <div style={styles.timeSlotsSection}>
          <h3 style={styles.sectionTitle}>{t("calendar.selectTime")}</h3>
          <DayTimeSlots
            espaceId={Number(espaceId)}
            selectedDate={selectedDate}
            onSelectTimeSlot={handleTimeSlotClick}
            selectedStartTime={startTime}
            selectedEndTime={endTime}
          />
        </div>
      )}

      {startTime && endTime && (
        <div style={styles.summaryCard}>
          <h3 style={styles.summaryTitle}>{t("calendar.reservationSummary")}</h3>
          <div style={styles.summaryDetails}>
            <p>
              <strong>{t("common.date")} :</strong> {selectedDate}
            </p>
            <p>
              <strong>{t("common.time")} :</strong> {startTime} - {endTime}
            </p>
          </div>

          {isAuditoire && (
            <div style={styles.justificationSection}>
              <label style={styles.justificationLabel}>
                {t("reservation.justificationLabel")} <span style={styles.required}>*</span>
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder={t("reservation.justificationPlaceholder")}
                style={styles.justificationTextarea}
                rows={4}
                required
              />
            </div>
          )}

          <div style={styles.totalBox}>
            <span>{t("reservation.totalPrice")} :</span>
            <span style={styles.totalAmount}>{totalPrice.toFixed(2)} €</span>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.buttonGroup}>
            <button type="button" onClick={handleReset} style={styles.resetButton} disabled={creatingReservation}>
              {t("calendar.resetSelection")}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              style={isAuditoire ? styles.submitButtonAuditoire : styles.submitButton}
              disabled={creatingReservation}
            >
              {creatingReservation
                ? t("common.loading")
                : isAuditoire
                ? t("reservation.submitRequest")
                : t("reservation.proceedPayment")}
            </button>
          </div>
        </div>
      )}

      {error && !startTime && <p style={styles.error}>{error}</p>}

      <button type="button" onClick={() => navigate("/espace")} style={styles.cancelButton}>
        {t("common.back")}
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  title: {
    fontSize: "1.8rem",
    marginBottom: "1.5rem",
    color: "#1f2937",
  },
  espaceCard: {
    background: "#fff",
    borderRadius: "8px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  espaceName: {
    fontSize: "1.3rem",
    marginBottom: "1rem",
    color: "#374151",
  },
  espaceInfo: {
    display: "grid",
    gap: "0.5rem",
    color: "#4b5563",
  },
  warningBox: {
    marginTop: "1rem",
    padding: "0.75rem",
    background: "#fef3c7",
    border: "1px solid #f59e0b",
    borderRadius: "6px",
    color: "#92400e",
    fontSize: "0.9rem",
  },
  calendarSection: {
    marginBottom: "1.5rem",
  },
  timeSlotsSection: {
    marginBottom: "1.5rem",
  },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "0.75rem",
  },
  summaryCard: {
    background: "#fff",
    borderRadius: "8px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    border: "2px solid #2563eb",
  },
  summaryTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "1rem",
  },
  summaryDetails: {
    display: "grid",
    gap: "0.5rem",
    color: "#4b5563",
    marginBottom: "1rem",
  },
  justificationSection: {
    marginBottom: "1rem",
  },
  justificationLabel: {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "500",
    color: "#374151",
  },
  required: {
    color: "#dc2626",
  },
  justificationTextarea: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "1rem",
    boxSizing: "border-box",
    resize: "vertical",
  },
  totalBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f3f4f6",
    padding: "1rem",
    borderRadius: "6px",
    marginBottom: "1rem",
  },
  totalAmount: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#1f2937",
  },
  error: {
    color: "#dc2626",
    background: "#fef2f2",
    padding: "0.75rem",
    borderRadius: "6px",
    marginBottom: "1rem",
  },
  loadingBox: {
    background: "#fff",
    borderRadius: "8px",
    padding: "2rem",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
  },
  resetButton: {
    flex: 1,
    padding: "0.75rem 1rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    background: "#fff",
    color: "#374151",
    fontSize: "1rem",
    cursor: "pointer",
  },
  cancelButton: {
    padding: "0.75rem 1.5rem",
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
  submitButtonAuditoire: {
    flex: 1,
    padding: "0.75rem 1rem",
    border: "none",
    borderRadius: "6px",
    background: "#f59e0b",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "500",
    cursor: "pointer",
  },
};
