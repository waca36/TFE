import { useEffect, useState } from "react";
import { getEspaces } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./EspacesPage.module.css";

export default function EspacesPage() {
  const { user } = useAuth();
  const [espaces, setEspaces] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    getEspaces().then(setEspaces);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1>{t('spaces.title')}</h1>
          {user && <p className={styles.subtitle}>{t('spaces.welcome')} {user.firstName}</p>}
        </div>
        {user && (
          <Link to="/my-reservations?tab=spaces" className={styles.linkGhost}>
            ← {t('reservation.myReservations')}
          </Link>
        )}
      </div>

      {espaces.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{t('spaces.noSpaces')}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {espaces.map((e) => (
            <div key={e.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{e.name}</h3>
                <span className={styles.cardBadge}>{t(`spaceType.${e.type}`) || e.type}</span>
              </div>

              <div className={styles.cardDetails}>
                <div className={styles.cardDetail}>
                  <span className={styles.cardIcon}>👥</span>
                  <span>{t('common.capacity')}: <strong>{e.capacity} {t('common.persons')}</strong></span>
                </div>
              </div>

              <div className={styles.price}>
                {e.basePrice} €
                <span className={styles.priceUnit}>/ {t('common.perHour')}</span>
              </div>

              <div className={styles.cardFooter}>
                {user ? (
                  <Link to={`/reservations/new/${e.id}`} className={styles.reserveButton}>
                    {t('spaces.reserve')} →
                  </Link>
                ) : (
                  <Link to="/login" className={styles.loginButton}>
                    {t('spaces.loginToReserve')}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
