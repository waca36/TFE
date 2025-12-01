import { useState } from "react";
import { registerRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("Ouassim");
  const [lastName, setLastName] = useState("Boumlik");
  const [email, setEmail] = useState("ouassim3@example.com");
  const [password, setPassword] = useState("motdepasse123");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = await registerRequest({
        firstName,
        lastName,
        email,
        password,
      });
      login(data.user, data.token);
      navigate("/espace");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Créer un compte</h1>
      <form onSubmit={submit}>
        <input
          placeholder="Prénom"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        /><br />
        <input
          placeholder="Nom"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        /><br />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <input
          placeholder="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <button>S'inscrire</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        Déjà inscrit ? <Link to="/login">Connexion</Link>
      </p>
    </div>
  );
}
