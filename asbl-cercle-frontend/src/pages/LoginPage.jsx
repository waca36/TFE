import { useState } from "react";
import { loginRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginRequest(email, password);
      login(data.user, data.token);
      navigate("/espace");
    } catch (err) {
      setError(t('auth.loginError'));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>{t('auth.login')}</h1>
        <form onSubmit={submit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('auth.email')}</label>
            <input
              type="email"
              placeholder={t('auth.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('auth.password')}</label>
            <input
              type="password"
              placeholder={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <button type="submit" style={styles.button}>{t('auth.loginButton')}</button>
        </form>
        {error && <p style={styles.error}>{error}</p>}
        <p style={styles.link}>
          {t('auth.noAccount')} <Link to="/register">{t('auth.createAccount')}</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f3f4f6",
  },
  card: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    fontSize: "1.5rem",
    marginBottom: "1.5rem",
    textAlign: "center",
    color: "#1f2937",
  },
  formGroup: {
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    color: "#374151",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  error: {
    color: "#dc2626",
    marginTop: "1rem",
    textAlign: "center",
  },
  link: {
    marginTop: "1rem",
    textAlign: "center",
    color: "#6b7280",
  },
};
