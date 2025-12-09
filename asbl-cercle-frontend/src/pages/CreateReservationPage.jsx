import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getEspaces, requestAuditoriumReservation, createReservation } from "../services/api";
import { useTranslation } from "react-i18next";
import PaymentForm from "../components/PaymentForm";
import ReservationCalendar from "../components/ReservationCalendar";
import DayTimeSlots from "../components/DayTimeSlots";
import styles from "./CreateReservationPage.module.css";

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
          totalPrice,
          justification,
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
          totalPrice,
          paymentIntentId,
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
  if (loading) return <p className={styles.info}>{t("common.loading")}</p>;
  if (error && !espace) return <p className={styles.error}>{error}</p>;

  if (showPayment) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>{t("payment.title")}</h1>

        {creatingReservation ? (
          <div className={styles.loadingBox}>
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

        {error && <p className={styles.error}>{error}</p>}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t("reservation.newReservation")}</h1>

      {espace && (
        <div className={styles.espaceCard}>
          <h2 className={styles.espaceName}>{espace.name}</h2>
          <div className={styles.espaceInfo}>
            <p>
              <strong>{t("spaces.type")} :</strong> {espace.type}
            </p>
            <p>
              <strong>{t("common.capacity")} :</strong> {espace.capacity} {t("common.persons")}
            </p>
            <p>
              <strong>{t("spaces.basePrice")} :</strong> {espace.basePrice} €
            </p>
          </div>

          {espace.type === "AUDITOIRE" && (
            <div className={styles.warningBox}>
              {t("reservation.auditoriumWarning")}
            </div>
          )}
        </div>
      )}

      <div className={styles.calendarSection}>
        <h3 className={styles.sectionTitle}>{t("calendar.selectDay")}</h3>
        <ReservationCalendar espaceId={Number(espaceId)} onSelectDate={handleDateSelect} selectedDate={selectedDate} />
      </div>

      {selectedDate && (
        <div className={styles.timeSlotsSection}>
          <h3 className={styles.sectionTitle}>{t("calendar.selectTime")}</h3>
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
        <div className={styles.summaryCard}>
          <h3 className={styles.summaryTitle}>{t("calendar.reservationSummary")}</h3>
          <div className={styles.summaryDetails}>
            <p>
              <strong>{t("common.date")} :</strong> {selectedDate}
            </p>
            <p>
              <strong>{t("common.time")} :</strong> {startTime} - {endTime}
            </p>
          </div>

          {isAuditoire && (
            <div className={styles.justificationSection}>
              <label className={styles.justificationLabel}>
                {t("reservation.justificationLabel")} <span className={styles.required}>*</span>
              </label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder={t("reservation.justificationPlaceholder")}
                className={styles.justificationTextarea}
                rows={4}
                required
              />
            </div>
          )}

          <div className={styles.totalBox}>
            <span>{t("reservation.totalPrice")} :</span>
            <span className={styles.totalAmount}>{totalPrice.toFixed(2)} €</span>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.buttonGroup}>
            <button type="button" onClick={handleReset} className={styles.resetButton} disabled={creatingReservation}>
              {t("calendar.resetSelection")}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className={isAuditoire ? styles.submitButtonAuditoire : styles.submitButton}
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

      {error && !startTime && <p className={styles.error}>{error}</p>}

      <button type="button" onClick={() => navigate("/espace")} className={styles.cancelButton}>
        {t("common.back")}
      </button>
    </div>
  );
}
