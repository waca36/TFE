import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyReservations, cancelReservation, payApprovedReservation } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PaymentForm from "../components/PaymentForm";
import styles from "./MyReservationsPage.module.css";

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

export default function MyReservationsPage() {
  const { user, token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingReservation, setPayingReservation] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetchReservations = () => {
    if (!user || !token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    getMyReservations(token)
      .then(setReservations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReservations();
  }, [user, token]);

  const handleCancel = async (id) => {
    if (!window.confirm(t("reservation.confirmCancel"))) return;
    try {
      await cancelReservation(id, token);
      fetchReservations();
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    setProcessingPayment(true);
    try {
      await payApprovedReservation(payingReservation.id, paymentIntentId, token);
      alert(t("payment.success"));
      setPayingReservation(null);
      fetchReservations();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePaymentCancel = () => {
    setPayingReservation(null);
  };

  const getStatusClass = (status) => {
    const map = {
      CONFIRMED: styles.statusConfirmed,
      PENDING_APPROVAL: styles.statusPending,
      APPROVED: styles.statusApproved,
      CANCELLED: styles.statusCancelled,
      REJECTED: styles.statusRejected,
    };
    return map[status] || styles.statusDefault;
  };

  if (loading) return <p className={styles.info}>{t("common.loading")}</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  if (payingReservation) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>{t("reservation.payReservation")}</h1>

        <div className={styles.paymentCard}>
          <h3>{payingReservation.espace?.name}</h3>
          <p>
            <strong>{t("common.date")} :</strong> {payingReservation.startDateTime.replace("T", " ")} - {payingReservation.endDateTime.split("T")[1]}
          </p>
          <p>
            <strong>{t("reservation.totalPrice")} :</strong> {payingReservation.totalPrice.toFixed(2)} €
          </p>
        </div>

        {processingPayment ? (
          <div className={styles.loadingBox}>
            <p>{t("payment.processing")}</p>
          </div>
        ) : (
          <PaymentForm
            stripePublicKey={STRIPE_PUBLIC_KEY}
            token={token}
            amount={payingReservation.totalPrice}
            description={`${t("reservation.payReservation")}: ${payingReservation.espace?.name}`}
            reservationType="SPACE"
            metadata={{ reservationId: payingReservation.id }}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        )}
      </div>
    );
  }

  const approvedReservations = reservations.filter((r) => r.status === "APPROVED");
  const otherReservations = reservations.filter((r) => r.status !== "APPROVED");

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t("reservation.myReservations")}</h1>

      {approvedReservations.length > 0 && (
        <div className={styles.approvedSection}>
          <h2 className={styles.sectionTitle}>{t("reservation.awaitingPayment")}</h2>
          <p className={styles.sectionDesc}>{t("reservation.awaitingPaymentDesc")}</p>

          <div className={styles.approvedList}>
            {approvedReservations.map((r) => (
              <div key={r.id} className={styles.approvedCard}>
                <div className={styles.approvedHeader}>
                  <h3 className={styles.approvedEspace}>{r.espace?.name}</h3>
                  <span className={`${styles.badge} ${getStatusClass("APPROVED")}`}>
                    {t("status.approved")}
                  </span>
                </div>
                <div className={styles.approvedDetails}>
                  <p>
                    <strong>{t("common.date")} :</strong> {r.startDateTime.replace("T", " ")} - {r.endDateTime.split("T")[1]}
                  </p>
                  <p>
                    <strong>{t("reservation.totalPrice")} :</strong> {r.totalPrice.toFixed(2)} €
                  </p>
                  {r.justification && (
                    <p>
                      <strong>{t("reservation.justification")} :</strong> {r.justification}
                    </p>
                  )}
                </div>
                <div className={styles.approvedActions}>
                  <button onClick={() => setPayingReservation(r)} className={styles.payButton}>
                    {t("reservation.payNow")}
                  </button>
                  <button onClick={() => handleCancel(r.id)} className={styles.cancelButtonSmall}>
                    {t("reservation.cancel")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {otherReservations.length === 0 && approvedReservations.length === 0 ? (
        <p className={styles.info}>{t("reservation.noReservations")}</p>
      ) : otherReservations.length > 0 && (
        <>
          {approvedReservations.length > 0 && <h2 className={styles.sectionTitle}>{t("reservation.allReservations")}</h2>}
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("spaces.space")}</th>
                <th>{t("reservation.startDate")}</th>
                <th>{t("reservation.endDate")}</th>
                <th>{t("common.total")}</th>
                <th>{t("common.status")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {otherReservations.map((r) => {
                const isPast = new Date(r.startDateTime) < new Date();
                const canCancel = !isPast && r.status !== "CANCELLED" && r.status !== "REJECTED";

                return (
                  <tr key={r.id}>
                    <td>{r.espace?.name || r.espaceName}</td>
                    <td>{r.startDateTime.replace("T", " ")}</td>
                    <td>{r.endDateTime.replace("T", " ")}</td>
                    <td>{r.totalPrice?.toFixed(2)} €</td>
                    <td>
                      <span className={`${styles.badge} ${getStatusClass(r.status)}`}>
                        {t(`status.${r.status.toLowerCase()}`)}
                      </span>
                      {r.status === "REJECTED" && r.rejectionReason && (
                        <p className={styles.rejectionReason}>
                          {t("organizer.rejectionReason")}: {r.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td>
                      {canCancel ? (
                        <button onClick={() => handleCancel(r.id)} className={styles.cancelButton}>
                          {t("reservation.cancel")}
                        </button>
                      ) : (
                        <span className={styles.disabledText}>{isPast ? t("reservation.passed") : "-"}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
