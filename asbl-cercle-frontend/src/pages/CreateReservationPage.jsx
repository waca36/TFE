import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getEspaces } from "../services/api";
import { useTranslation } from "react-i18next";
import PaymentForm from "../components/PaymentForm";

const STRIPE_PUBLIC_KEY = "pk_test_51SZtvU43LA5MMUSyvqwMUBrZfuUUVrERUSNHtXE6j60tCbnIc5DTcaKJO1RlgpjgniuXjsFiIJsyM9jjZizdLxxn008fF3zfDs";
const API_URL = "http://localhost:8080";

export default function CreateReservationPage() {
  const { espaceId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { t } = useTranslation();

  const [espace, setEspace] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("12:00");
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
    if (!espace || !startDate || !endDate) return espace?.basePrice || 0;
    
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    const hours = Math.max(1, (end - start) / (1000 * 60 * 60));
    
    return espace.basePrice * hours;
  };

  const totalPrice = calculateTotalPrice();

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setError("");

    if (!startDate || !endDate) {
      setError(t('reservation.dateError'));
      return;
    }

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    if (end <= start) {
      setError(t('reservation.dateOrderError'));
      return;
    }

    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    setCreatingReservation(true);
    setError("");

    const startDateTime = `${startDate}T${startTime}:00`;
    const endDateTime = `${endDate}T${endTime}:00`;

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
            description={`${t('reservation.newReservation')}: ${espace.name} - ${startDate} ${startTime} ${t('common.to').toLowerCase()} ${endDate} ${endTime}`}
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

      <form onSubmit={handleProceedToPayment} style={styles.form}>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('reservation.startDate')}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('reservation.startTime')}</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={styles.input}
              required
            />
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('reservation.endDate')}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('reservation.endTime')}</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={styles.input}
              required
            />
          </div>
        </div>

        <div style={styles.totalBox}>
          <span>{t('reservation.totalPrice')} :</span>
          <span style={styles.totalAmount}>{totalPrice.toFixed(2)} €</span>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => navigate("/espace")}
            style={styles.cancelButton}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            style={styles.submitButton}
          >
            {t('reservation.proceedPayment')}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
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
  form: {
    background: "#fff",
    borderRadius: "8px",
    padding: "1.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  formRow: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
  },
  formGroup: {
    flex: 1,
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
  totalBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f3f4f6",
    padding: "1rem",
    borderRadius: "6px",
    marginBottom: "1.5rem",
    marginTop: "1rem",
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
