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
        <Link to="/" style={styles.logo}>ASBL CERCLE</Link>
      </div>

      <nav style={styles.nav}>
        <Link to="/espace" style={styles.link}>{t('nav.spaces')}</Link>
        <Link to="/events" style={styles.link}>{t('nav.events')}</Link>
        <Link to="/garderie" style={styles.link}>{t('nav.childcare')}</Link>

        {user && (
          <>
            <span style={styles.separator}>|</span>
            <Link to="/reservations" style={styles.link}>{t('nav.myReservations')}</Link>
            <Link to="/events/my" style={styles.link}>{t('nav.myEvents')}</Link>
            <Link to="/garderie/my" style={styles.link}>{t('nav.myChildcare')}</Link>
          </>
        )}

        {/* Lien Organisateur */}
        {user && (user.role === "ORGANIZER" || user.role === "ADMIN") && (
          <>
            <span style={styles.separator}>|</span>
            <Link to="/organizer/events" style={styles.organizerLink}>
              📅 {t('nav.organizerEvents')}
            </Link>
          </>
        )}

        {/* Lien Admin */}
        {user?.role === "ADMIN" && (
          <Link to="/admin" style={styles.adminLink}>
            ⚙️ {t('nav.admin')}
          </Link>
        )}
      </nav>

      <div style={styles.rightSection}>
        <LanguageSwitcher />
        
        {user ? (
          <>
            <span style={styles.greeting}>
              {t('nav.hello')}, <b>{user.firstName}</b>
              {user.role === "ORGANIZER" && <span style={styles.roleBadge}>Organisateur</span>}
              {user.role === "ADMIN" && <span style={styles.adminBadge}>Admin</span>}
            </span>
            <Link to="/profile" style={styles.link}>{t('nav.profile')}</Link>
            <button onClick={handleLogout} style={styles.button}>
              {t('nav.logout')}
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>{t('nav.login')}</Link>
            <Link to="/register" style={styles.linkRegister}>{t('nav.register')}</Link>
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
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  logo: {
    fontWeight: "bold",
    letterSpacing: "0.05em",
    color: "#f9fafb",
    textDecoration: "none",
    fontSize: "1.1rem",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  link: {
    color: "#e5e7eb",
    textDecoration: "none",
    fontSize: "0.9rem",
    transition: "color 0.2s",
  },
  separator: {
    color: "#4b5563",
  },
  organizerLink: {
    color: "#a78bfa",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  adminLink: {
    color: "#fbbf24",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  greeting: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.9rem",
  },
  roleBadge: {
    background: "#8b5cf6",
    color: "#fff",
    padding: "0.15rem 0.5rem",
    borderRadius: "10px",
    fontSize: "0.7rem",
    fontWeight: "500",
  },
  adminBadge: {
    background: "#f59e0b",
    color: "#fff",
    padding: "0.15rem 0.5rem",
    borderRadius: "10px",
    fontSize: "0.7rem",
    fontWeight: "500",
  },
  button: {
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    background: "#374151",
    color: "#f9fafb",
    fontSize: "0.85rem",
  },
  linkRegister: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "0.9rem",
    background: "#6366f1",
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
  },
};
