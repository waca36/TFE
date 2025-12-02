import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGarderieSessions } from "../services/api";
import { useAuth } from "../context/AuthContext";
import PaymentForm from "../components/PaymentForm";

const STRIPE_PUBLIC_KEY = "pk_test_51SZtvU43LA5MMUSyvqwMUBrZfuUUVrERUSNHtXE6j60tCbnIc5DTcaKJO1RlgpjgniuXjsFiIJsyM9jjZizdLxxn008fF3zfDs";
const API_URL = "http://localhost:8080";

export default function GarderieReservePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

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

  // Appelé quand le paiement Stripe est réussi
  const handlePaymentSuccess = async (paymentIntentId) => {
    setCreatingReservation(true);
    setError("");

    try {
      // Créer la réservation avec le paymentIntentId
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

      alert("Paiement réussi ! Votre réservation est confirmée.");
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

  if (loading) return <p>Chargement...</p>;
  if (error && !session) return <p style={{ color: "red" }}>{error}</p>;

  // Afficher le formulaire de paiement
  if (showPayment) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Paiement</h1>
        
        {creatingReservation ? (
          <div style={styles.loadingBox}>
            <p>Création de votre réservation en cours...</p>
          </div>
        ) : (
          <PaymentForm
            stripePublicKey={STRIPE_PUBLIC_KEY}
            token={token}
            amount={totalAmount}
            description={`Garderie: ${session.title} - ${numberOfChildren} enfant(s)`}
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

  // Afficher le formulaire de sélection
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Réserver une place en garderie</h1>

      {session && (
        <div style={styles.sessionCard}>
          <h2 style={styles.sessionTitle}>{session.title}</h2>
          <div style={styles.sessionInfo}>
            <p><strong>Date :</strong> {session.sessionDate}</p>
            <p><strong>Horaire :</strong> {session.startTime} - {session.endTime}</p>
            <p><strong>Prix par enfant :</strong> {session.pricePerChild} €</p>
            <p><strong>Description :</strong> {session.description || "Aucune"}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleProceedToPayment} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Nombre d'enfants :</label>
          <input
            type="number"
            min="1"
            value={numberOfChildren}
            onChange={(e) => setNumberOfChildren(parseInt(e.target.value) || 1)}
            style={styles.input}
          />
        </div>

        <div style={styles.totalBox}>
          <span>Total à payer :</span>
          <span style={styles.totalAmount}>{totalAmount.toFixed(2)} €</span>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => navigate("/garderie")}
            style={styles.cancelButton}
          >
            Annuler
          </button>
          <button
            type="submit"
            style={styles.submitButton}
          >
            Procéder au paiement
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