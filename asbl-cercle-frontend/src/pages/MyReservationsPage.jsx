import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyReservations, cancelReservation, payApprovedReservation } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PaymentForm from "../components/PaymentForm";

const STRIPE_PUBLIC_KEY = "pk_test_51SZtvU43LA5MMUSyvqwMUBrZfuUUVrERUSNHtXE6j60tCbnIc5DTcaKJO1RlgpjgniuXjsFiIJsyM9jjZizdLxxn008fF3zfDs";

export default function MyReservationsPage() {
  const { user, token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Pour le paiement d'une réservation approuvée
  const [payingReservation, setPayingReservation] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

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
    if (!window.confirm(t('reservation.confirmCancel'))) return;

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
      alert(t('payment.success'));
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

  const getStatusStyle = (status) => {
    const styles = {
      CONFIRMED: { background: "#d1fae5", color: "#065f46" },
      PENDING_APPROVAL: { background: "#fef3c7", color: "#92400e" },
      APPROVED: { background: "#dbeafe", color: "#1e40af" },
      CANCELLED: { background: "#f3f4f6", color: "#6b7280" },
      REJECTED: { background: "#fee2e2", color: "#991b1b" },
    };
    return styles[status] || { background: "#f3f4f6", color: "#6b7280" };
  };

  if (loading) return <p>{t('common.loading')}</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // Si on est en train de payer une réservation
  if (payingReservation) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>{t('reservation.payReservation')}</h1>

        <div style={styles.paymentCard}>
          <h3>{payingReservation.espace?.name}</h3>
          <p><strong>{t('common.date')} :</strong> {payingReservation.startDateTime.replace("T", " ")} - {payingReservation.endDateTime.split("T")[1]}</p>
          <p><strong>{t('reservation.totalPrice')} :</strong> {payingReservation.totalPrice.toFixed(2)} €</p>
        </div>

        {processingPayment ? (
          <div style={styles.loadingBox}>
            <p>{t('payment.processing')}</p>
          </div>
        ) : (
          <PaymentForm
            stripePublicKey={STRIPE_PUBLIC_KEY}
            token={token}
            amount={payingReservation.totalPrice}
            description={`${t('reservation.payReservation')}: ${payingReservation.espace?.name}`}
            reservationType="ESPACE"
            metadata={{ reservationId: payingReservation.id }}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        )}
      </div>
    );
  }

  // Séparer les réservations par statut pour mettre en avant celles à payer
  const approvedReservations = reservations.filter(r => r.status === "APPROVED");
  const otherReservations = reservations.filter(r => r.status !== "APPROVED");

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{t('reservation.myReservations')}</h1>

      {/* Section: Réservations approuvées en attente de paiement */}
      {approvedReservations.length > 0 && (
        <div style={styles.approvedSection}>
          <h2 style={styles.sectionTitle}>{t('reservation.awaitingPayment')}</h2>
          <p style={styles.sectionDesc}>{t('reservation.awaitingPaymentDesc')}</p>

          <div style={styles.approvedList}>
            {approvedReservations.map((r) => (
              <div key={r.id} style={styles.approvedCard}>
                <div style={styles.approvedHeader}>
                  <h3 style={styles.approvedEspace}>{r.espace?.name}</h3>
                  <span style={{...styles.badge, ...getStatusStyle("APPROVED")}}>
                    {t('status.approved')}
                  </span>
                </div>
                <div style={styles.approvedDetails}>
                  <p><strong>{t('common.date')} :</strong> {r.startDateTime.replace("T", " ")} - {r.endDateTime.split("T")[1]}</p>
                  <p><strong>{t('reservation.totalPrice')} :</strong> {r.totalPrice.toFixed(2)} €</p>
                  {r.justification && (
                    <p><strong>{t('reservation.justification')} :</strong> {r.justification}</p>
                  )}
                </div>
                <div style={styles.approvedActions}>
                  <button
                    onClick={() => setPayingReservation(r)}
                    style={styles.payButton}
                  >
                    {t('reservation.payNow')}
                  </button>
                  <button
                    onClick={() => handleCancel(r.id)}
                    style={styles.cancelButtonSmall}
                  >
                    {t('reservation.cancel')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section: Autres réservations */}
      {otherReservations.length === 0 && approvedReservations.length === 0 ? (
        <p>{t('reservation.noReservations')}</p>
      ) : otherReservations.length > 0 && (
        <>
          {approvedReservations.length > 0 && (
            <h2 style={styles.sectionTitle}>{t('reservation.allReservations')}</h2>
          )}
          <table border="1" cellPadding="10" style={styles.table}>
            <thead>
              <tr>
                <th>{t('spaces.space')}</th>
                <th>{t('reservation.startDate')}</th>
                <th>{t('reservation.endDate')}</th>
                <th>{t('common.total')}</th>
                <th>{t('common.status')}</th>
                <th>{t('common.actions')}</th>
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
                      <span style={{...styles.badge, ...getStatusStyle(r.status)}}>
                        {t(`status.${r.status.toLowerCase()}`)}
                      </span>
                      {r.status === "REJECTED" && r.rejectionReason && (
                        <p style={styles.rejectionReason}>
                          {t('organizer.rejectionReason')}: {r.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td>
                      {canCancel ? (
                        <button
                          onClick={() => handleCancel(r.id)}
                          style={styles.cancelButton}
                        >
                          {t('reservation.cancel')}
                        </button>
                      ) : (
                        <span style={styles.disabledText}>
                          {isPast ? t('reservation.passed') : "-"}
                        </span>
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

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
  },
  title: {
    fontSize: "1.8rem",
    marginBottom: "1.5rem",
    color: "#1f2937",
  },
  sectionTitle: {
    fontSize: "1.3rem",
    marginBottom: "0.5rem",
    color: "#374151",
  },
  sectionDesc: {
    color: "#6b7280",
    marginBottom: "1rem",
  },
  approvedSection: {
    marginBottom: "2rem",
    padding: "1.5rem",
    background: "#eff6ff",
    borderRadius: "12px",
    border: "2px solid #3b82f6",
  },
  approvedList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  approvedCard: {
    background: "#fff",
    borderRadius: "8px",
    padding: "1rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  approvedHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  approvedEspace: {
    margin: 0,
    fontSize: "1.1rem",
    color: "#1f2937",
  },
  approvedDetails: {
    marginBottom: "1rem",
    color: "#4b5563",
    fontSize: "0.9rem",
  },
  approvedActions: {
    display: "flex",
    gap: "0.75rem",
  },
  payButton: {
    padding: "0.6rem 1.5rem",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.95rem",
  },
  cancelButtonSmall: {
    padding: "0.6rem 1rem",
    background: "#fff",
    color: "#dc2626",
    border: "1px solid #dc2626",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  paymentCard: {
    background: "#fff",
    borderRadius: "8px",
    padding: "1.5rem",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  loadingBox: {
    background: "#fff",
    borderRadius: "8px",
    padding: "2rem",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  table: {
    borderCollapse: "collapse",
    width: "100%",
    background: "#fff",
  },
  badge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.8rem",
    fontWeight: "500",
  },
  rejectionReason: {
    marginTop: "0.5rem",
    fontSize: "0.8rem",
    color: "#991b1b",
    fontStyle: "italic",
  },
  cancelButton: {
    padding: "0.4rem 0.8rem",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  disabledText: {
    color: "#9ca3af",
    fontSize: "0.85rem",
  },
};
