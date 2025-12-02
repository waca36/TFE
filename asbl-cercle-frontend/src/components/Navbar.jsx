import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header style={styles.header}>
      <div>
        <span style={styles.logo}>ASBL CERCLE</span>
      </div>

      <nav style={styles.nav}>
        <Link to="/espace" style={styles.link}>{t('nav.spaces')}</Link>
        <Link to="/events" style={styles.link}>{t('nav.events')}</Link>
        <Link to="/garderie" style={styles.link}>{t('nav.childcare')}</Link>

        {user && (
          <>
            <Link to="/reservations" style={styles.link}>{t('nav.myReservations')}</Link>
            <Link to="/garderie/my" style={styles.link}>{t('nav.myChildcare')}</Link>
          </>
        )}

        {user?.role === "ADMIN" && (
          <Link to="/admin" style={styles.link}>{t('nav.admin')}</Link>
        )}
      </nav>

      <div style={styles.rightSection}>
        <LanguageSwitcher />
        
        {user ? (
          <>
            <span style={styles.greeting}>
              {t('nav.hello')}, <b>{user.firstName}</b>
            </span>
            <Link to="/profile" style={styles.link}>{t('nav.profile')}</Link>
            <button onClick={handleLogout} style={styles.button}>
              {t('nav.logout')}
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>{t('nav.login')}</Link>
            <Link to="/register" style={styles.link}>{t('nav.register')}</Link>
          </>
        )}
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 1.5rem",
    background: "#1f2937",
    color: "#f9fafb",
  },
  logo: {
    fontWeight: "bold",
    letterSpacing: "0.05em",
  },
  nav: {
    display: "flex",
    gap: "1rem",
  },
  link: {
    color: "#e5e7eb",
    textDecoration: "none",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  greeting: {
    marginRight: "0.5rem",
  },
  button: {
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
};
