import { useState } from "react";
import { registerRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./RegisterPage.module.css";

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      setError(t("auth.registerError"));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t("auth.register")}</h1>
        <form onSubmit={submit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t("auth.firstName")}</label>
            <input
              type="text"
              placeholder={t("auth.firstName")}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={styles.input}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t("auth.lastName")}</label>
            <input
              type="text"
              placeholder={t("auth.lastName")}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={styles.input}
              required
            />
          </div>
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
            {t("auth.registerButton")}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
        <p className={styles.link}>
          {t("auth.hasAccount")} <Link to="/login">{t("auth.loginLink")}</Link>
        </p>
      </div>
    </div>
  );
}
