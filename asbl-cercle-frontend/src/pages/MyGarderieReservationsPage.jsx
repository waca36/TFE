import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyGarderieReservations } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function MyGarderieReservationsPage() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyGarderieReservations(token)
      .then(setReservations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>Mes réservations garderie</h1>

      <p>
        <Link to="/garderie">← Retour aux sessions</Link>
      </p>

      {reservations.length === 0 ? (
        <p>Vous n'avez aucune réservation.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Session</th>
              <th>Date</th>
              <th>Horaire</th>
              <th>Enfants</th>
              <th>Total</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id}>
                <td>{r.sessionTitle}</td>
                <td>{r.sessionDate}</td>
                <td>{r.startTime} - {r.endTime}</td>
                <td>{r.numberOfChildren}</td>
                <td>{r.totalPrice} €</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}