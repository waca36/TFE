import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useTranslation } from "react-i18next";
import styles from "./PaymentForm.module.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080") + "/api";
const EURO = "\u20ac";

const cardStyle = {
  hidePostalCode: true,
  style: {
    base: {
      color: "var(--blue-dark)",
      fontFamily: '"Poppins", "Segoe UI", system-ui, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#a4a197",
      },
    },
    invalid: {
      color: "#c27546",
      iconColor: "#c27546",
    },
  },
};

function CheckoutForm({ amount, description, reservationType, metadata, onSuccess, onCancel, token }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/payments/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency: "eur",
          description,
          reservationType,
          ...metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const { clientSecret } = await response.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        onSuccess(result.paymentIntent.id);
      }
    } catch (err) {
      setError(t("payment.error") + " " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formHeader}>
        <div>
          <p className={styles.kicker}>{t("payment.secure")}</p>
          <h2 className={styles.title}>{t("payment.cardInfo")}</h2>
        </div>
        <span className={styles.badge}>SSL</span>
      </div>

      <div className={styles.summary}>
        <p className={styles.description}>{description}</p>
        <p className={styles.amount}>
          {amount.toFixed(2)} {EURO}
        </p>
      </div>

      <div className={styles.cardContainer}>
        <label className={styles.label}>{t("payment.cardInfo")}</label>
        <div className={styles.cardElement}>
          <CardElement options={cardStyle} />
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.buttonGroup}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          {t("common.cancel")}
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className={styles.submitButton}
        >
          {loading ? t("payment.processing") : `${t("payment.pay")} ${amount.toFixed(2)} ${EURO}`}
        </button>
      </div>

      <div className={styles.securityBadge}>SSL - {t("payment.securedBy")}</div>
    </form>
  );
}

export default function PaymentForm({ stripePublicKey, token, ...props }) {
  const stripePromise = loadStripe(stripePublicKey);

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} token={token} />
    </Elements>
  );
}
