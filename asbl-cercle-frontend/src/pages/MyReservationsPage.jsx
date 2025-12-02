import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getReservationsByUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function MyReservationsPage() {
  const { user, token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    getReservationsByUser(user.id, token)
      .then(setReservations)
      .catch(console.error);
  }, [user, token, navigate]);

  return (
    <div>
      <h1>{t('reservation.myReservations')}</h1>

      <hr />

      {reservations.length === 0 && <p>{t('reservation.noReservations')}</p>}

      {reservations.map((r) => (
        <div key={r.id} style={styles.card}>
          <h3>{r.espace.name}</h3>
          <p>
            {t('common.from')} {r.startDateTime.replace("T", " ")} {t('common.to').toLowerCase()}{" "}
            {r.endDateTime.replace("T", " ")}
          </p>
          <p>{t('reservation.totalPrice')} : {r.totalPrice} €</p>
          <p>{t('common.status')} : {t(`status.${r.status.toLowerCase()}`)}</p>
        </div>
      ))}
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
};
