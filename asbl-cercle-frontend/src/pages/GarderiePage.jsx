import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGarderieSessions } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function GarderiePage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    getGarderieSessions()
      .then(setSessions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>Garderie - Sessions disponibles</h1>
      
      {user && (
        <p>
          <Link to="/garderie/my">📋 Voir mes réservations</Link>
        </p>
      )}

      {sessions.length === 0 ? (
        <p>Aucune session disponible pour le moment.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Titre</th>
              <th>Date</th>
              <th>Horaire</th>
              <th>Prix/enfant</th>
              <th>Places</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td>{s.title}</td>
                <td>{s.sessionDate}</td>
                <td>{s.startTime} - {s.endTime}</td>
                <td>{s.pricePerChild} €</td>
                <td>{s.capacity}</td>
                <td>
                  {user ? (
                    <Link to={`/garderie/reserve/${s.id}`}>Réserver</Link>
                  ) : (
                    <Link to="/login">Se connecter</Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}