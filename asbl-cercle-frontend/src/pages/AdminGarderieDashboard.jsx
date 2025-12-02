import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminGetGarderieSessions, adminDeleteGarderieSession } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AdminGarderieDashboard() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSessions = () => {
    setLoading(true);
    adminGetGarderieSessions(token)
      .then(setSessions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSessions();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette session ?")) return;
    try {
      await adminDeleteGarderieSession(id, token);
      fetchSessions();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>Admin - Gestion Garderie</h1>

      <p>
        <Link to="/admin">← Retour au dashboard</Link>
        {" | "}
        <Link to="/admin/garderie/new">+ Nouvelle session</Link>
      </p>

      {sessions.length === 0 ? (
        <p>Aucune session créée.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Titre</th>
              <th>Date</th>
              <th>Horaire</th>
              <th>Capacité</th>
              <th>Prix</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.title}</td>
                <td>{s.sessionDate}</td>
                <td>{s.startTime} - {s.endTime}</td>
                <td>{s.capacity}</td>
                <td>{s.pricePerChild} €</td>
                <td>{s.status}</td>
                <td>
                  <Link to={`/admin/garderie/edit/${s.id}`}>Modifier</Link>
                  {" | "}
                  <button onClick={() => handleDelete(s.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}