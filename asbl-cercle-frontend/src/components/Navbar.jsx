import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <div className={styles.leftControls}>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <div className={styles.authSection}>
            {user ? (
              <>
                <span className={styles.greeting}>
                  {t("nav.hello")}, <b>{user.firstName}</b>
                </span>
                <Link to="/profile" className={styles.topLink}>
                  {t("nav.profile")}
                </Link>
                <button onClick={handleLogout} className={styles.topButton}>
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.topLink}>
                  {t("nav.login")}
                </Link>
                <Link to="/register" className={styles.topCta}>
                  {t("nav.register")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

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
            {t("nav.home")}
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
            <Link to="/my-reservations" className={styles.link}>
              {t("nav.myReservations")}
            </Link>
          )}

          {user && (user.role === "ORGANIZER" || user.role === "ADMIN") && (
            <Link to="/organizer/events" className={styles.highlightLink}>
              {t("nav.organizerEvents")}
            </Link>
          )}

          {user?.role === "ADMIN" && (
            <Link to="/admin" className={styles.adminLink}>
              {t("nav.admin")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
