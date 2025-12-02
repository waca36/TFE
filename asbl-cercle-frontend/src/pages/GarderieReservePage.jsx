import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGarderieSessions, createGarderieReservation } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function GarderieReservePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [session, setSession] = useState(null);
  const [numberOfChildren, setNumberOfChildren] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getGarderieSessions()
      .then((sessions) => {
        const found = sessions.find((s) => s.id === parseInt(id));
        if (found) {
          setSession(found);
        } else {
          setError("Session introuvable");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await createGarderieReservation(
        {
          sessionId: parseInt(id),
          numberOfChildren: numberOfChildren,
        },
        token
      );
      alert("Réservation confirmée !");
      navigate("/garderie/my");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error && !session) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>Réserver une place en garderie</h1>

      {session && (
        <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ccc" }}>
          <h2>{session.title}</h2>
          <p><strong>Date :</strong> {session.sessionDate}</p>
          <p><strong>Horaire :</strong> {session.startTime} - {session.endTime}</p>
          <p><strong>Prix par enfant :</strong> {session.pricePerChild} €</p>
          <p><strong>Description :</strong> {session.description || "Aucune"}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>
            Nombre d'enfants :
            <input
              type="number"
              min="1"
              value={numberOfChildren}
              onChange={(e) => setNumberOfChildren(parseInt(e.target.value))}
              style={{ marginLeft: "10px", width: "60px" }}
            />
          </label>
        </div>

        {session && (
          <p>
            <strong>Total :</strong> {(session.pricePerChild * numberOfChildren).toFixed(2)} €
          </p>
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? "Réservation en cours..." : "Confirmer la réservation"}
        </button>
      </form>
    </div>
  );
}