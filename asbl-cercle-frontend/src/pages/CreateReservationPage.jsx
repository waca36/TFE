import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getEspaces } from "../services/api";
import { useTranslation } from "react-i18next";
import PaymentForm from "../components/PaymentForm";
import ReservationCalendar from "../components/ReservationCalendar";
import DayTimeSlots from "../components/DayTimeSlots";

const STRIPE_PUBLIC_KEY = "pk_test_51SZtvU43LA5MMUSyvqwMUBrZfuUUVrERUSNHtXE6j60tCbnIc5DTcaKJO1RlgpjgniuXjsFiIJsyM9jjZizdLxxn008fF3zfDs";
const API_URL = "http://localhost:8080";

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
        const endHour = clickedHour + 1;
        setEndTime(`${String(endHour).padStart(2, "0")}:00`);
      } else {
        setStartTime(time);
        setEndTime("");
      }
    } else {
      setStartTime(time);
      setEndTime("");
    }
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setError("");

    if (!selectedDate) {
      setError(t('calendar.selectDayFirst'));
      return;
    }

    if (!startTime || !endTime) {
      setError(t('calendar.selectTimeSlots'));
      return;
    }

    const start = new Date(`${selectedDate}T${startTime}`);
    const end = new Date(`${selectedDate}T${endTime}`);

    if (end <= start) {
      setError(t('reservation.dateOrderError'));
      return;
    }

    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    setCreatingReservation(true);
    setError("");

    const startDateTime = `${selectedDate}T${startTime}:00`;
    const endDateTime = `${selectedDate}T${endTime}:00`;

    try {
      const response = await fetch(`${API_URL}/api/public/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          espaceId: Number(espaceId),
          startDateTime,
          endDateTime,
          totalPrice: totalPrice,
          paymentIntentId: paymentIntentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de la création de la réservation");
      }

      alert(t('payment.success'));
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
  if (loading) return <p>{t('common.loading')}</p>;
  if (error && !espace) return <p style={{ color: "red" }}>{error}</p>;

  if (showPayment) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>{t('payment.title')}</h1>

        {creatingReservation ? (
          <div style={styles.loadingBox}>
            <p>{t('reservation.creating')}</p>
          </div>
        ) : (
          <PaymentForm
            stripePublicKey={STRIPE_PUBLIC_KEY}
            token={token}
            amount={totalPrice}
            description={`${t('reservation.newReservation')}: ${espace.name} - ${selectedDate} ${startTime} ${t('common.to').toLowerCase()} ${endTime}`}
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
      <h1 style={styles.title}>{t('reservation.newReservation')}</h1>

      {espace && (
        <div style={styles.espaceCard}>
          <h2 style={styles.espaceName}>{espace.name}</h2>
          <div style={styles.espaceInfo}>
            <p><strong>{t('common.type')} :</strong> {espace.type}</p>
            <p><strong>{t('common.capacity')} :</strong> {espace.capacity} {t('common.persons')}</p>
            <p><strong>{t('common.price')} :</strong> {espace.basePrice} € {t('common.perHour')}</p>
          </div>
        </div>
      )}

      <div style={styles.calendarSection}>
        <h3 style={styles.sectionTitle}>{t('calendar.selectDate')}</h3>
        <ReservationCalendar
          espaceId={Number(espaceId)}
          onSelectDate={handleDateSelect}
          selectedDate={selectedDate}
        />
      </div>

      {selectedDate && (
        <div style={styles.timeSlotsSection}>
          <h3 style={styles.sectionTitle}>{t('calendar.selectTime')}</h3>
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
          <h3 style={styles.summaryTitle}>{t('calendar.reservationSummary')}</h3>
          <div style={styles.summaryDetails}>
            <p><strong>{t('common.date')} :</strong> {selectedDate}</p>
            <p><strong>{t('common.time')} :</strong> {startTime} - {endTime}</p>
          </div>
          <div style={styles.totalBox}>
            <span>{t('reservation.totalPrice')} :</span>
            <span style={styles.totalAmount}>{totalPrice.toFixed(2)} €</span>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={handleReset}
              style={styles.resetButton}
            >
              {t('calendar.resetSelection')}
            </button>
            <button
              type="button"
              onClick={handleProceedToPayment}
              style={styles.submitButton}
            >
              {t('reservation.proceedPayment')}
            </button>
          </div>
        </div>
      )}

      {error && !startTime && <p style={styles.error}>{error}</p>}

      <button
        type="button"
        onClick={() => navigate("/espace")}
        style={styles.cancelButton}
      >
        {t('common.back')}
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
};
