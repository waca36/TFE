import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createReservation, getEspaces } from "../services/api";

export default function CreateReservationPage() {
  const { espaceId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [espace, setEspace] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("12:00");
  const [totalPrice, setTotalPrice] = useState(200);
  const [error, setError] = useState("");

  useEffect(() => {
    // si pas connecté → retour login
    if (!user || !token) {
      navigate("/login");
      return;
    }

    // récupérer l'espace à partir de la liste
    getEspaces()
      .then((list) => {
        const found = list.find((e) => String(e.id) === String(espaceId));
        setEspace(found || null);
      })
      .catch((err) => setError(err.message));
  }, [user, token, espaceId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!startDate || !endDate) {
      setError("Veuillez choisir des dates de début et de fin");
      return;
    }

    const startDateTime = `${startDate}T${startTime}:00`;
    const endDateTime = `${endDate}T${endTime}:00`;

    try {
      await createReservation(
        {
          userId: user.id,
          espaceId: Number(espaceId),
          startDateTime,
          endDateTime,
          totalPrice: Number(totalPrice),
        },
        token
      );
      // après création → on renvoie sur Mes réservations
      navigate("/reservations");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user || !token) return null;

  return (
    <div >
      <h1>Nouvelle réservation</h1>

      <hr />

      {espace && (
        <div style={{ marginBottom: "1rem" }}>
          <h2>{espace.name}</h2>
          <p>Type : {espace.type}</p>
          <p>Capacité : {espace.capacity}</p>
          <p>Prix de base : {espace.basePrice} €</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Date de début :</label><br />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label>Heure de début :</label><br />
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div>
          <label>Date de fin :</label><br />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div>
          <label>Heure de fin :</label><br />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <div>
          <label>Prix total (€) :</label><br />
          <input
            type="number"
            value={totalPrice}
            onChange={(e) => setTotalPrice(e.target.value)}
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button style={{ marginTop: "1rem" }}>Confirmer la réservation</button>
      </form>
    </div>
  );
}
