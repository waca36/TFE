import { useEffect, useState } from "react";
import { getEspaces } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function EspacesPage() {
  const { user } = useAuth();
  const [espaces, setEspaces] = useState([]);

  useEffect(() => {
    getEspaces().then(setEspaces);
  }, []);

  return (
    <div>
      <h1>Espaces disponibles</h1>
      {user && <p>Bienvenue {user.firstName}</p>}
      <hr />

      {espaces.map((e) => (
        <div key={e.id}>
          <h3>{e.name}</h3>
          <p>Type : {e.type}</p>
          <p>Capacité : {e.capacity}</p>
          <p>Prix : {e.basePrice}€</p>
          <Link to={`/reservations/new/${e.id}`}>Réserver cet espace</Link>
          <hr />
        </div>
      ))}
    </div>
  );
}
