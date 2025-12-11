import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getMyReservations,
  cancelReservation,
  payApprovedReservation,
  getMyEventRegistrations,
  cancelEventRegistration,
  getMyGarderieReservations,
  cancelGarderieReservation,
} from "../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PaymentForm from "../components/PaymentForm";
import styles from "./MyReservationsPage.module.css";

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

export default function MyReservationsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "spaces");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Space reservations
  const [spaceReservations, setSpaceReservations] = useState([]);
  const [payingReservation, setPayingReservation] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Event registrations
  const [eventRegistrations, setEventRegistrations] = useState([]);

  // Garderie reservations
  const [garderieReservations, setGarderieReservations] = useState([]);

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }
    fetchAllData();
  }, [user, token]);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab]);

  const fetchAllData = async () => {
    setLoading(true);
    setError("");
    try {
      const [spaces, events, garderie] = await Promise.all([
        getMyReservations(token),
        getMyEventRegistrations(token),
        getMyGarderieReservations(token),
      ]);
      setSpaceReservations(spaces);
      setEventRegistrations(events);
      setGarderieReservations(garderie);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Space handlers
  const handleCancelSpace = async (id) => {
    if (!window.confirm(t("reservation.confirmCancel"))) return;
    try {
      await cancelReservation(id, token);
      fetchAllData();
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
      fetchAllData();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  // Event handlers
  const handleCancelEvent = async (id) => {
    if (!window.confirm(t("events.confirmCancel"))) return;
    try {
      await cancelEventRegistration(id, token);
      fetchAllData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Garderie handlers
  const handleCancelGarderie = async (id) => {
    if (!window.confirm(t("childcare.confirmCancel"))) return;
    try {
      await cancelGarderieReservation(id, token);
      fetchAllData();
    } catch (err) {
      alert(err.message);
    }
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

  // Payment form view
  if (payingReservation) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>{t("reservation.payReservation")}</h1>
        <div className={styles.paymentCard}>
          <h3>{payingReservation.espace?.name}</h3>
          <p>
            <strong>{t("common.date")} :</strong> {payingReservation.startDateTime.replace("T", " ")} -{" "}
            {payingReservation.endDateTime.split("T")[1]}
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
            onCancel={() => setPayingReservation(null)}
          />
        )}
      </div>
    );
  }

  const approvedSpaceReservations = spaceReservations.filter((r) => r.status === "APPROVED");
  const otherSpaceReservations = spaceReservations.filter((r) => r.status !== "APPROVED");

  const tabs = [
    { id: "spaces", label: t("nav.spaces"), count: spaceReservations.length },
    { id: "events", label: t("nav.events"), count: eventRegistrations.length },
    { id: "childcare", label: t("nav.childcare"), count: garderieReservations.length },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t("nav.myReservations")}</h1>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.count > 0 && <span className={styles.tabCount}>{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Spaces Tab */}
      {activeTab === "spaces" && (
        <div className={styles.tabContent}>
          {approvedSpaceReservations.length > 0 && (
            <div className={styles.approvedSection}>
              <h2 className={styles.sectionTitle}>{t("reservation.awaitingPayment")}</h2>
              <p className={styles.sectionDesc}>{t("reservation.awaitingPaymentDesc")}</p>
              <div className={styles.approvedList}>
                {approvedSpaceReservations.map((r) => (
                  <div key={r.id} className={styles.approvedCard}>
                    <div className={styles.approvedHeader}>
                      <h3 className={styles.approvedEspace}>{r.espace?.name}</h3>
                      <span className={`${styles.badge} ${getStatusClass("APPROVED")}`}>{t("status.approved")}</span>
                    </div>
                    <div className={styles.approvedDetails}>
                      <p>
                        <strong>{t("common.date")} :</strong> {r.startDateTime.replace("T", " ")} -{" "}
                        {r.endDateTime.split("T")[1]}
                      </p>
                      <p>
                        <strong>{t("reservation.totalPrice")} :</strong> {r.totalPrice.toFixed(2)} €
                      </p>
                    </div>
                    <div className={styles.approvedActions}>
                      <button onClick={() => setPayingReservation(r)} className={styles.payButton}>
                        {t("reservation.payNow")}
                      </button>
                      <button onClick={() => handleCancelSpace(r.id)} className={styles.cancelButtonSmall}>
                        {t("reservation.cancel")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {otherSpaceReservations.length === 0 && approvedSpaceReservations.length === 0 ? (
            <p className={styles.info}>{t("reservation.noReservations")}</p>
          ) : (
            otherSpaceReservations.length > 0 && (
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
                  {otherSpaceReservations.map((r) => {
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
                        </td>
                        <td>
                          {canCancel ? (
                            <button onClick={() => handleCancelSpace(r.id)} className={styles.cancelButton}>
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
            )
          )}
        </div>
      )}

      {/* Events Tab */}
      {activeTab === "events" && (
        <div className={styles.tabContent}>
          {eventRegistrations.length === 0 ? (
            <p className={styles.info}>{t("events.noRegistrations")}</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("events.event")}</th>
                  <th>{t("common.date")}</th>
                  <th>{t("events.participants")}</th>
                  <th>{t("common.total")}</th>
                  <th>{t("common.status")}</th>
                  <th>{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {eventRegistrations.map((r) => {
                  const isPast = new Date(r.eventStartDateTime) < new Date();
                  const canCancel = !isPast && r.status !== "CANCELLED";
                  return (
                    <tr key={r.id}>
                      <td>{r.eventTitle}</td>
                      <td>{r.eventStartDateTime.replace("T", " ")}</td>
                      <td>{r.numberOfParticipants}</td>
                      <td>{r.totalPrice > 0 ? `${r.totalPrice} €` : t("events.free")}</td>
                      <td>
                        <span className={`${styles.badge} ${getStatusClass(r.status)}`}>
                          {t(`status.${r.status.toLowerCase()}`)}
                        </span>
                      </td>
                      <td>
                        {canCancel ? (
                          <button onClick={() => handleCancelEvent(r.id)} className={styles.cancelButton}>
                            {t("events.cancelRegistration")}
                          </button>
                        ) : (
                          <span className={styles.disabledText}>{isPast ? t("events.eventPassed") : "-"}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Childcare Tab */}
      {activeTab === "childcare" && (
        <div className={styles.tabContent}>
          {garderieReservations.length === 0 ? (
            <p className={styles.info}>{t("childcare.noReservations")}</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t("childcare.session")}</th>
                  <th>{t("common.date")}</th>
                  <th>{t("common.time")}</th>
                  <th>{t("common.children")}</th>
                  <th>{t("common.total")}</th>
                  <th>{t("common.status")}</th>
                  <th>{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {garderieReservations.map((r) => {
                  const isPast = new Date(r.sessionDate) < new Date();
                  const canCancel = !isPast && r.status !== "CANCELLED";
                  return (
                    <tr key={r.id}>
                      <td>{r.sessionTitle}</td>
                      <td>{r.sessionDate}</td>
                      <td>
                        {r.startTime} - {r.endTime}
                      </td>
                      <td>{r.numberOfChildren}</td>
                      <td>{r.totalPrice} €</td>
                      <td>
                        <span className={`${styles.badge} ${getStatusClass(r.status)}`}>
                          {t(`status.${r.status.toLowerCase()}`)}
                        </span>
                      </td>
                      <td>
                        {canCancel ? (
                          <button onClick={() => handleCancelGarderie(r.id)} className={styles.cancelButton}>
                            {t("childcare.cancelReservation")}
                          </button>
                        ) : (
                          <span className={styles.disabledText}>{isPast ? t("childcare.sessionPassed") : "-"}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
