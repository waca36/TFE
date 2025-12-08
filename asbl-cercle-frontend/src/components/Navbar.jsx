import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoMark}>
            <img src="/assets/logo-cercle.svg" alt="Logo Cercle" className={styles.logoImg} />
          </div>
          <div className={styles.logoTextBlock}>
            <div className={styles.logoText}>ASBL Cercle</div>
            <div className={styles.logoSub}>Espaces & evenements</div>
          </div>
        </Link>

        <nav className={styles.nav}>
          <Link to="/" className={styles.link}>
            Accueil
          </Link>
          <Link to="/espace" className={styles.link}>
            {t("nav.spaces")}
          </Link>
          <Link to="/events" className={styles.link}>
            {t("nav.events")}
          </Link>
          <Link to="/garderie" className={styles.link}>
            {t("nav.childcare")}
          </Link>

          {user && (
            <>
              <Link to="/reservations" className={styles.link}>
                {t("nav.myReservations")}
              </Link>
              <Link to="/events/my" className={styles.link}>
                {t("nav.myEvents")}
              </Link>
              <Link to="/garderie/my" className={styles.link}>
                {t("nav.myChildcare")}
              </Link>
            </>
          )}

          {user && (user.role === "ORGANIZER" || user.role === "ADMIN") && (
            <Link to="/organizer/events" className={styles.highlightLink}>
              <span className={styles.chip}>Organisateur</span> {t("nav.organizerEvents")}
            </Link>
          )}

          {user?.role === "ADMIN" && (
            <Link to="/admin" className={styles.adminLink}>
              <span className={styles.adminChip}>Admin</span> {t("nav.admin")}
            </Link>
          )}
        </nav>

        <div className={styles.rightSection}>
          <LanguageSwitcher />

          {user ? (
            <>
              <span className={styles.greeting}>
                {t("nav.hello")}, <b>{user.firstName}</b>
              </span>
              <Link to="/profile" className={styles.link}>
                {t("nav.profile")}
              </Link>
              <button onClick={handleLogout} className={styles.button}>
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.link}>
                {t("nav.login")}
              </Link>
              <Link to="/register" className={styles.cta}>
                {t("nav.register")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
