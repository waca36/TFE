import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getReservationsByUser } from "../services/api";
import { Link, useNavigate } from "react-router-dom";

export default function MyReservationsPage() {
  const { user, token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    getReservationsByUser(user.id, token)
      .then(setReservations)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>Mes réservations</h1>

      <hr />

      {reservations.map((r) => (
        <div key={r.id}>
          <h3>{r.espace.name}</h3>
          <p>
            Du {r.startDateTime.replace("T", " ")} au{" "}
            {r.endDateTime.replace("T", " ")}
          </p>
          <p>Prix total : {r.totalPrice}€</p>
          <hr />
        </div>
      ))}

      {reservations.length === 0 && <p>Aucune réservation.</p>}
    </div>
  );
}
