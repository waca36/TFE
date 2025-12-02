import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicEvents, registerToEvent } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import PaymentForm from "../components/PaymentForm";

const STRIPE_PUBLIC_KEY = "pk_test_51SZtvU43LA5MMUSyvqwMUBrZfuUUVrERUSNHtXE6j60tCbnIc5DTcaKJO1RlgpjgniuXjsFiIJsyM9jjZizdLxxn008fF3zfDs";

export default function EventRegisterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { t } = useTranslation();

  const [event, setEvent] = useState(null);
  const [numberOfParticipants, setNumberOfParticipants] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [showPayment, setShowPayment] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    getPublicEvents()
      .then((events) => {
        const found = events.find((e) => e.id === parseInt(id));
        if (found) {
          setEvent(found);
        } else {
          setError(t('events.notFound'));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, user, token, navigate, t]);

  const isPaid = event?.price && event.price > 0;
  const totalAmount = isPaid ? event.price * numberOfParticipants : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isPaid) {
      setShowPayment(true);
    } else {
      await completeRegistration(null);
    }
  };

  const completeRegistration = async (paymentIntentId) => {
    setRegistering(true);
    setError("");

    try {
      await registerToEvent({
        eventId: parseInt(id),
        numberOfParticipants,
        paymentIntentId,
      }, token);

      alert(isPaid ? t('payment.success') : t('events.registrationSuccess'));
      navigate("/events/my");
    } catch (err) {
      setError(err.message);
      setShowPayment(false);
    } finally {
      setRegistering(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    await completeRegistration(paymentIntentId);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  if (!user || !token) return null;
  if (loading) return <p>{t('common.loading')}</p>;
  if (error && !event) return <p style={{ color: "red" }}>{error}</p>;

  if (showPayment && isPaid) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>{t('payment.title')}</h1>
        
        {registering ? (
          <div style={styles.loadingBox}>
            <p>{t('events.registering')}</p>
          </div>
        ) : (
          <PaymentForm
            stripePublicKey={STRIPE_PUBLIC_KEY}
            token={token}
            amount={totalAmount}
            description={`${t('events.registration')}: ${event.title} - ${numberOfParticipants} ${t('events.participant', { count: numberOfParticipants })}`}
            reservationType="EVENT"
            metadata={{
              eventId: parseInt(id),
              numberOfParticipants,
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
      <h1 style={styles.title}>{t('events.registerFor')}</h1>

      {event && (
        <div style={styles.eventCard}>
          <h2 style={styles.eventTitle}>{event.title}</h2>
          <div style={styles.eventInfo}>
            <p><strong>{t('common.date')} :</strong> {event.startDateTime.replace("T", " ")}</p>
            <p><strong>{t('common.description')} :</strong> {event.description}</p>
            {event.capacity && (
              <p><strong>{t('common.capacity')} :</strong> {event.capacity} {t('common.persons')}</p>
            )}
            <p>
              <strong>{t('common.price')} :</strong>{" "}
              {isPaid ? `${event.price} € / ${t('events.participant', { count: 1 })}` : t('events.free')}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>{t('events.numberOfParticipants')} :</label>
          <input
            type="number"
            min="1"
            max={event?.capacity || 100}
            value={numberOfParticipants}
            onChange={(e) => setNumberOfParticipants(parseInt(e.target.value) || 1)}
            style={styles.input}
          />
        </div>

        {isPaid && (
          <div style={styles.totalBox}>
            <span>{t('reservation.totalPrice')} :</span>
            <span style={styles.totalAmount}>{totalAmount.toFixed(2)} €</span>
          </div>
        )}

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => navigate("/events")}
            style={styles.cancelButton}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            style={styles.submitButton}
            disabled={registering}
          >
            {registering 
              ? t('common.loading') 
              : isPaid 
                ? t('reservation.proceedPayment') 
                : t('events.confirmRegistration')
            }
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
  eventCard: {
    background: "#fff",
    borderRadius: "8px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  eventTitle: {
    fontSize: "1.3rem",
    marginBottom: "1rem",
    color: "#374151",
  },
  eventInfo: {
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
  formGroup: {
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    width: "80px",
    padding: "0.5rem 1rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "1rem",
  },
  totalBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f3f4f6",
    padding: "1rem",
    borderRadius: "6px",
    marginBottom: "1.5rem",
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
