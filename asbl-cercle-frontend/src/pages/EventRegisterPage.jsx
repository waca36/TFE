import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicEvents, registerToEvent, createGarderieReservation } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import PaymentForm from "../components/PaymentForm";
import styles from "./EventRegisterPage.module.css";

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

export default function EventRegisterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { t } = useTranslation();

  const [event, setEvent] = useState(null);
  const [numberOfParticipants, setNumberOfParticipants] = useState(1);
  const [addChildcare, setAddChildcare] = useState(false);
  const [childrenCount, setChildrenCount] = useState(1);
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
          setError(t("events.notFound"));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, user, token, navigate, t]);

  const hasGarderie = !!event?.garderieSessionId;
  const eventPrice = event?.price || 0;
  const garderieUnit = event?.garderiePrice || 0;
  const eventTotal = eventPrice * numberOfParticipants;
  const garderieTotal = hasGarderie && addChildcare ? garderieUnit * childrenCount : 0;
  const totalAmount = eventTotal + garderieTotal;
  const requiresPayment = totalAmount > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (requiresPayment) {
      setShowPayment(true);
    } else {
      await completeRegistration(null);
    }
  };

  const completeRegistration = async (paymentIntentId) => {
    setRegistering(true);
    setError("");

    try {
      await registerToEvent(
        {
          eventId: parseInt(id),
          numberOfParticipants,
          paymentIntentId,
        },
        token
      );

      if (hasGarderie && addChildcare && childrenCount > 0) {
        await createGarderieReservation(
          {
            sessionId: event.garderieSessionId,
            numberOfChildren: childrenCount,
            paymentIntentId,
          },
          token
        );
      }

      alert(requiresPayment ? t("payment.success") : t("events.registrationSuccess"));
      navigate("/my-reservations?tab=events");
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
  if (loading) return <p className={styles.info}>{t("common.loading")}</p>;
  if (error && !event) return <p className={styles.error}>{error}</p>;

  if (showPayment && requiresPayment) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>{t("payment.title")}</h1>

        {registering ? (
          <div className={styles.loadingBox}>
            <p>{t("events.registering")}</p>
          </div>
        ) : (
          <PaymentForm
            stripePublicKey={STRIPE_PUBLIC_KEY}
            token={token}
            amount={totalAmount}
            description={`${t("events.registration")}: ${event.title} - ${numberOfParticipants} ${t("events.participant", { count: numberOfParticipants })}`}
            reservationType="EVENT"
            metadata={{
              eventId: parseInt(id),
              numberOfParticipants,
              garderieSessionId: hasGarderie && addChildcare ? event.garderieSessionId : undefined,
              numberOfChildren: hasGarderie && addChildcare ? childrenCount : undefined,
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
      <h1 className={styles.title}>{t("events.registerFor")}</h1>

      {event && (
        <div className={styles.eventCard}>
          <h2 className={styles.eventTitle}>{event.title}</h2>
          <div className={styles.eventInfo}>
            <p>
              <strong>{t("common.date")} :</strong> {event.startDateTime.replace("T", " ")}
            </p>
            <p>
              <strong>{t("common.description")} :</strong> {event.description}
            </p>
            {event.capacity && (
              <p>
                <strong>{t("common.capacity")} :</strong> {event.capacity} {t("common.persons")}
              </p>
            )}
            <p>
              <strong>{t("common.price")} :</strong>{" "}
              {eventPrice > 0 ? `${eventPrice} € / ${t("events.participant", { count: 1 })}` : t("events.free")}
            </p>
            {hasGarderie && (
              <p>
                <strong>Garderie :</strong>{" "}
                {garderieUnit > 0 ? `${garderieUnit} € / enfant` : t("events.free")}
              </p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>{t("events.numberOfParticipants")} :</label>
          <input
            type="number"
            min="1"
            max={event?.capacity || 100}
            value={numberOfParticipants}
            onChange={(e) => setNumberOfParticipants(parseInt(e.target.value) || 1)}
            className={styles.input}
          />
        </div>

        {hasGarderie && (
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <input
                type="checkbox"
                checked={addChildcare}
                onChange={(e) => setAddChildcare(e.target.checked)}
                className={styles.checkbox}
              />
              Ajouter la garderie
            </label>

            {addChildcare && (
              <div className={styles.childcareBlock}>
                <label className={styles.label}>Nombre d'enfants :</label>
                <input
                  type="number"
                  min="1"
                  value={childrenCount}
                  onChange={(e) => setChildrenCount(parseInt(e.target.value) || 1)}
                  className={styles.input}
                />
                <p className={styles.helper}>
                  Tarif garderie : {garderieUnit} € / enfant
                </p>
              </div>
            )}
          </div>
        )}

        {requiresPayment && (
          <div className={styles.totalBox}>
            <span>{t("reservation.totalPrice")} :</span>
            <span className={styles.totalAmount}>{totalAmount.toFixed(2)} €</span>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.buttonGroup}>
          <button type="button" onClick={() => navigate("/events")} className={styles.cancelButton}>
            {t("common.cancel")}
          </button>
          <button type="submit" className={styles.submitButton} disabled={registering}>
            {registering
              ? t("common.loading")
              : requiresPayment
              ? t("reservation.proceedPayment")
              : t("events.confirmRegistration")}
          </button>
        </div>
      </form>
    </div>
  );
}
