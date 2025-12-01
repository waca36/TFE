import { useState } from "react";
import { loginRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("ouassim2@example.com");
  const [password, setPassword] = useState("motdepasse123");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginRequest(email, password);
      login(data.user, data.token);
      navigate("/espace");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Connexion</h1>
      <form onSubmit={submit}>
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
        <button>Se connecter</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        Pas de compte ? <Link to="/register">Créer un compte</Link>
      </p>
    </div>
  );
}
