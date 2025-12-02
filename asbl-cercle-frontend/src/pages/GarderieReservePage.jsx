import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGarderieSessions } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import PaymentForm from "../components/PaymentForm";

const STRIPE_PUBLIC_KEY = "pk_test_51SZtvU43LA5MMUSyvqwMUBrZfuUUVrERUSNHtXE6j60tCbnIc5DTcaKJO1RlgpjgniuXjsFiIJsyM9jjZizdLxxn008fF3zfDs";
const API_URL = "http://localhost:8080";

export default function GarderieReservePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { t } = useTranslation();

  const [session, setSession] = useState(null);
  const [numberOfChildren, setNumberOfChildren] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [showPayment, setShowPayment] = useState(false);
  const [creatingReservation, setCreatingReservation] = useState(false);

  useEffect(() => {
    getGarderieSessions()
      .then((sessions) => {
        const found = sessions.find((s) => s.id === parseInt(id));
        if (found) {
          setSession(found);
        } else {
          setError("Session introuvable");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const totalAmount = session ? session.pricePerChild * numberOfChildren : 0;

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    setCreatingReservation(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/public/garderie/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: parseInt(id),
          numberOfChildren: numberOfChildren,
          paymentIntentId: paymentIntentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de la création de la réservation");
      }

      alert(t('payment.success'));
      navigate("/garderie/my");
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

  if (loading) return <p>{t('common.loading')}</p>;
  if (error && !session) return <p style={{ color: "red" }}>{error}</p>;

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
            amount={totalAmount}
            description={`${t('childcare.session')}: ${session.title} - ${numberOfChildren} ${t('common.children')}`}
            reservationType="GARDERIE"
            metadata={{
              sessionId: parseInt(id),
              numberOfChildren: numberOfChildren,
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
      <h1 style={styles.title}>{t('childcare.reservePlace')}</h1>

      {session && (
        <div style={styles.sessionCard}>
          <h2 style={styles.sessionTitle}>{session.title}</h2>
          <div style={styles.sessionInfo}>
            <p><strong>{t('common.date')} :</strong> {session.sessionDate}</p>
            <p><strong>{t('common.time')} :</strong> {session.startTime} - {session.endTime}</p>
            <p><strong>{t('childcare.pricePerChild')} :</strong> {session.pricePerChild} €</p>
            <p><strong>{t('common.description')} :</strong> {session.description || "-"}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleProceedToPayment} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>{t('childcare.numberOfChildren')} :</label>
          <input
            type="number"
            min="1"
            value={numberOfChildren}
            onChange={(e) => setNumberOfChildren(parseInt(e.target.value) || 1)}
            style={styles.input}
          />
        </div>

        <div style={styles.totalBox}>
          <span>{t('reservation.totalPrice')} :</span>
          <span style={styles.totalAmount}>{totalAmount.toFixed(2)} €</span>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => navigate("/garderie")}
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
  sessionCard: {
    background: "#fff",
    borderRadius: "8px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  sessionTitle: {
    fontSize: "1.3rem",
    marginBottom: "1rem",
    color: "#374151",
  },
  sessionInfo: {
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
