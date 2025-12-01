import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  adminCreateEspace,
  adminGetEspace,
  adminUpdateEspace,
} from "../services/api";
import { useNavigate, useParams, Link } from "react-router-dom";

export default function AdminEspaceForm() {
  const { user, token } = useAuth();
  const { id } = useParams(); // si id existe => édition, sinon création
  const navigate = useNavigate();

  const isEditMode = !!id;

  const [form, setForm] = useState({
    name: "",
    type: "",
    capacity: 0,
    basePrice: 0,
    status: "AVAILABLE",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }

    if (isEditMode) {
      adminGetEspace(id, token)
        .then((e) =>
          setForm({
            name: e.name || "",
            type: e.type || "",
            capacity: e.capacity || 0,
            basePrice: e.basePrice || 0,
            status: e.status || "AVAILABLE",
          })
        )
        .catch((err) => setError(err.message));
    }
  }, [user, token, id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "capacity" || name === "basePrice"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isEditMode) {
        await adminUpdateEspace(id, form, token);
      } else {
        await adminCreateEspace(form, token);
      }
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div>
      <h1>{isEditMode ? "Modifier un espace" : "Créer un espace"}</h1>

      <p>
        <Link to="/admin">← Retour au Dashboard</Link>
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom :</label><br />
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Type :</label><br />
          <input
            name="type"
            value={form.type}
            onChange={handleChange}
            placeholder="Salle, Terrain, Local..."
          />
        </div>

        <div>
          <label>Capacité :</label><br />
          <input
            type="number"
            name="capacity"
            value={form.capacity}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Prix de base (€) :</label><br />
          <input
            type="number"
            name="basePrice"
            value={form.basePrice}
            onChange={handleChange}
            step="0.01"
          />
        </div>

        <div>
          <label>Statut :</label><br />
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="UNAVAILABLE">UNAVAILABLE</option>
          </select>
        </div>

        <button style={{ marginTop: "1rem" }}>
          {isEditMode ? "Enregistrer" : "Créer"}
        </button>
      </form>
    </div>
  );
}
