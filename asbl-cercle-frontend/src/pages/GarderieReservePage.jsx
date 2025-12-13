import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGarderieSessions } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import PaymentForm from "../components/PaymentForm";
import styles from "./GarderieReservePage.module.css";

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: parseInt(id),
          numberOfChildren,
          paymentIntentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Erreur lors de la création de la réservation");
      }

      alert(t("payment.success"));
      navigate("/my-reservations?tab=childcare");
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

  if (loading) return <p className={styles.info}>{t("common.loading")}</p>;
  if (error && !session) return <p className={styles.error}>{error}</p>;

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
            amount={totalAmount}
            description={`${t("childcare.session")}: ${session.title} - ${numberOfChildren} ${t("common.children")}`}
            reservationType="GARDERIE"
            metadata={{
              sessionId: parseInt(id),
              numberOfChildren,
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
      <h1 className={styles.title}>{t("childcare.reservePlace")}</h1>

      {session && (
        <div className={styles.sessionCard}>
          <h2 className={styles.sessionTitle}>{session.title}</h2>
          <div className={styles.sessionInfo}>
            <p>
              <strong>{t("common.date")} :</strong> {session.sessionDate}
            </p>
            <p>
              <strong>{t("common.time")} :</strong> {session.startTime} - {session.endTime}
            </p>
            <p>
              <strong>{t("childcare.pricePerChild")} :</strong> {session.pricePerChild} €
            </p>
            <p>
              <strong>{t("common.description")} :</strong> {session.description || "-"}
            </p>
          </div>
          <div className={styles.ageInfo}>
            <span className={styles.ageIcon}>i</span>
            <span>{t("childcare.ageRequirement", { minAge: 3, maxAge: 12 })}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleProceedToPayment} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t("childcare.numberOfChildren")} :</label>
          <input
            type="number"
            min="1"
            value={numberOfChildren}
            onChange={(e) => setNumberOfChildren(parseInt(e.target.value) || 1)}
            className={styles.input}
          />
        </div>

        <div className={styles.totalBox}>
          <span>{t("reservation.totalPrice")} :</span>
          <span className={styles.totalAmount}>{totalAmount.toFixed(2)} €</span>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.buttonGroup}>
          <button type="button" onClick={() => navigate("/garderie")} className={styles.cancelButton}>
            {t("common.cancel")}
          </button>
          <button type="submit" className={styles.submitButton}>
            {t("reservation.proceedPayment")}
          </button>
        </div>
      </form>
    </div>
  );
}
