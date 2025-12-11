import { useState } from "react";
import { loginRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher";
import styles from "./LoginPage.module.css";

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
      setError(t("auth.loginError"));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.languageSwitcherWrapper}>
        <LanguageSwitcher />
      </div>
      <div className={styles.card}>
        <h1 className={styles.title}>{t("auth.login")}</h1>
        <form onSubmit={submit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t("auth.email")}</label>
            <input
              type="email"
              placeholder={t("auth.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t("auth.password")}</label>
            <input
              type="password"
              placeholder={t("auth.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <button type="submit" className={styles.button}>
            {t("auth.loginButton")}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
        <p className={styles.link}>
          {t("auth.noAccount")} <Link to="/register">{t("auth.createAccount")}</Link>
        </p>
      </div>
    </div>
  );
}
