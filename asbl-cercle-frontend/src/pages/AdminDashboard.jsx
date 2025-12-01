import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  adminGetEspaces,
  adminDeleteEspace,
} from "../services/api";
import { Link, useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [espaces, setEspaces] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }

    adminGetEspaces(token)
      .then(setEspaces)
      .catch((err) => setError(err.message));
  }, [user, token, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet espace ?")) return;
    try {
      await adminDeleteEspace(id, token);
      setEspaces((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div>
      <h1>Dashboard Admin</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ marginBottom: "1rem" }}>
        <Link to="/admin/espaces/new">+ Créer un espace</Link>
      </div>

      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Type</th>
            <th>Capacité</th>
            <th>Prix</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {espaces.map((e) => (
            <tr key={e.id}>
              <td>{e.name}</td>
              <td>{e.type}</td>
              <td>{e.capacity}</td>
              <td>{e.basePrice}€</td>
              <td>{e.status}</td>
              <td>
                <Link to={`/admin/espaces/${e.id}/edit`}>Modifier</Link>{" "}
                |{" "}
                <button onClick={() => handleDelete(e.id)}>
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
          {espaces.length === 0 && (
            <tr>
              <td colSpan="6">Aucun espace.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
