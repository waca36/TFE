import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.kicker}>{t("home.kicker")}</p>
          <h1 className={styles.title}>{t("home.title")}</h1>
          <p className={styles.lead}>{t("home.lead")}</p>
          <div className={styles.actions}>
            <Link to="/espace" className={styles.cta}>
              {t("home.reserveSpace")}
            </Link>
            <Link to="/events" className={styles.secondary}>
              {t("home.discoverEvents")}
            </Link>
          </div>
          <div className={styles.badges}>
            <span className={styles.pill}>{t("home.badge1")}</span>
            <span className={styles.pill}>{t("home.badge2")}</span>
            <span className={styles.pill}>{t("home.badge3")}</span>
          </div>
        </div>
        <div className={styles.heroCard}>
          <div className={styles.heroCardHeader}>
            <h2 className={styles.heroCardTitle}>{t("home.missionsTitle")}</h2>
            <p className={styles.heroCardText}>{t("home.missionsText")}</p>
          </div>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <div className={styles.bullet} />
              <div>
                <strong className={styles.listTitle}>{t("home.mission1Title")}</strong>
                <p className={styles.listText}>{t("home.mission1Text")}</p>
              </div>
            </li>
            <li className={styles.listItem}>
              <div className={styles.bullet} />
              <div>
                <strong className={styles.listTitle}>{t("home.mission2Title")}</strong>
                <p className={styles.listText}>{t("home.mission2Text")}</p>
              </div>
            </li>
            <li className={styles.listItem}>
              <div className={styles.bullet} />
              <div>
                <strong className={styles.listTitle}>{t("home.mission3Title")}</strong>
                <p className={styles.listText}>{t("home.mission3Text")}</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardTag}>{t("home.spacesTag")}</div>
          <h3 className={styles.cardTitle}>{t("home.spacesTitle")}</h3>
          <p className={styles.cardText}>{t("home.spacesText")}</p>
          <Link to="/espace" className={styles.link}>
            {t("home.spacesLink")}
          </Link>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTag}>{t("home.eventsTag")}</div>
          <h3 className={styles.cardTitle}>{t("home.eventsTitle")}</h3>
          <p className={styles.cardText}>{t("home.eventsText")}</p>
          <Link to="/events" className={styles.link}>
            {t("home.eventsLink")}
          </Link>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTag}>{t("home.garderieTag")}</div>
          <h3 className={styles.cardTitle}>{t("home.garderieTitle")}</h3>
          <p className={styles.cardText}>{t("home.garderieText")}</p>
          <Link to="/garderie" className={styles.link}>
            {t("home.garderieLink")}
          </Link>
        </div>
      </section>
    </div>
  );
}
