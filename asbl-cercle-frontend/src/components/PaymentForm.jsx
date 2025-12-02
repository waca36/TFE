import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useTranslation } from 'react-i18next';

const API_URL = 'http://localhost:8080/api';

const cardStyle = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
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
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency: 'eur',
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
      } else if (result.paymentIntent.status === 'succeeded') {
        onSuccess(result.paymentIntent.id);
      }
    } catch (err) {
      setError(t('payment.error') + ' ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>{t('payment.secure')}</h2>
      
      <div style={styles.summary}>
        <p style={styles.description}>{description}</p>
        <p style={styles.amount}>{amount.toFixed(2)} €</p>
      </div>

      <div style={styles.cardContainer}>
        <label style={styles.label}>{t('payment.cardInfo')}</label>
        <div style={styles.cardElement}>
          <CardElement options={cardStyle} />
        </div>
      </div>

      {error && (
        <div style={styles.error}>{error}</div>
      )}

      <div style={styles.buttonGroup}>
        <button
          type="button"
          onClick={onCancel}
          style={styles.cancelButton}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          style={{
            ...styles.submitButton,
            opacity: (!stripe || loading) ? 0.6 : 1,
            cursor: (!stripe || loading) ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? t('payment.processing') : `${t('payment.pay')} ${amount.toFixed(2)} €`}
        </button>
      </div>

      <div style={styles.securityBadge}>
        🔒 {t('payment.securedBy')}
      </div>
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

const styles = {
  form: {
    background: '#fff',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    maxWidth: '400px',
    margin: '0 auto',
  },
  title: {
    fontSize: '1.3rem',
    marginBottom: '1rem',
    color: '#1f2937',
  },
  summary: {
    background: '#f3f4f6',
    borderRadius: '6px',
    padding: '1rem',
    marginBottom: '1.5rem',
  },
  description: {
    color: '#6b7280',
    fontSize: '0.9rem',
    margin: 0,
  },
  amount: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0.5rem 0 0 0',
  },
  cardContainer: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#374151',
    fontSize: '0.9rem',
  },
  cardElement: {
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '0.75rem',
    background: '#fff',
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.75rem',
  },
  cancelButton: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    background: '#fff',
    color: '#374151',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  submitButton: {
    flex: 1,
    padding: '0.75rem',
    border: 'none',
    borderRadius: '6px',
    background: '#2563eb',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '500',
  },
  securityBadge: {
    textAlign: 'center',
    marginTop: '1rem',
    fontSize: '0.8rem',
    color: '#6b7280',
  },
};
