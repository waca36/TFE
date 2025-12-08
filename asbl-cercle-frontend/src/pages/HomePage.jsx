import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.kicker}>ASBL CERCLE</p>
          <h1 className={styles.title}>
            Des espaces, des événements et des services pour faire vivre votre communauté.
          </h1>
          <p className={styles.lead}>
            Cercle est une ASBL dédiée à la mise à disposition d'espaces adaptés, à l'organisation
            d'événements associatifs et à l'accompagnement des familles grâce à un service de
            garderie fiable.
          </p>
          <div className={styles.actions}>
            <Link to="/espace" className={styles.cta}>
              Réserver un espace
            </Link>
            <Link to="/events" className={styles.secondary}>
              Découvrir les événements
            </Link>
          </div>
          <div className={styles.badges}>
            <span className={styles.pill}>Gestion simple</span>
            <span className={styles.pill}>Accompagnement sur mesure</span>
            <span className={styles.pill}>Communauté engagée</span>
          </div>
        </div>
        <div className={styles.heroCard}>
          <div className={styles.heroCardHeader}>
            <h2 className={styles.heroCardTitle}>Nos missions</h2>
            <p className={styles.heroCardText}>
              Offrir des lieux, des événements et des services éducatifs pour renforcer le lien
              social.
            </p>
          </div>
          <ul className={styles.list}>
            <li className={styles.listItem}>
              <div className={styles.bullet} />
              <div>
                <strong className={styles.listTitle}>Espaces modulables</strong>
                <p className={styles.listText}>Salles équipées pour formations, réunions, ateliers et culture.</p>
              </div>
            </li>
            <li className={styles.listItem}>
              <div className={styles.bullet} />
              <div>
                <strong className={styles.listTitle}>Programmation événementielle</strong>
                <p className={styles.listText}>Agenda associatif, conférences, activités jeunesse et culturelles.</p>
              </div>
            </li>
            <li className={styles.listItem}>
              <div className={styles.bullet} />
              <div>
                <strong className={styles.listTitle}>Service garderie</strong>
                <p className={styles.listText}>Accueil encadré pour les enfants pendant vos activités.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardTag}>Espaces</div>
          <h3 className={styles.cardTitle}>Des lieux prêts à accueillir vos projets</h3>
          <p className={styles.cardText}>
            Choisissez parmi nos salles adaptées (réunion, conférence, ateliers). Equipements, capacité
            et tarifs transparents pour une organisation fluide.
          </p>
          <Link to="/espace" className={styles.link}>
            Voir les espaces →
          </Link>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTag}>Événements</div>
          <h3 className={styles.cardTitle}>Un agenda associatif vivant</h3>
          <p className={styles.cardText}>
            Participez ou proposez un événement. Notre équipe accompagne la validation, la mise en
            ligne et la gestion des inscriptions.
          </p>
          <Link to="/events" className={styles.link}>
            Découvrir le programme →
          </Link>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTag}>Garderie</div>
          <h3 className={styles.cardTitle}>Confiance et sérénité pour les parents</h3>
          <p className={styles.cardText}>
            Réservez un créneau garderie lors de vos activités. Encadrement qualifié, horaires souples,
            communication claire avec les familles.
          </p>
          <Link to="/garderie" className={styles.link}>
            Réserver une garderie →
          </Link>
        </div>
      </section>
    </div>
  );
}
