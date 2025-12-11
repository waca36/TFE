import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGarderieSessions } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import styles from "./GarderiePage.module.css";

export default function GarderiePage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    getGarderieSessions()
      .then(setSessions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className={styles.info}>{t("common.loading")}</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{t("childcare.title")}</h1>

      {user && (
        <p className={styles.linkRow}>
          <Link to="/my-reservations?tab=childcare" className={styles.linkGhost}>
            ← {t("childcare.viewMyReservations")}
          </Link>
        </p>
      )}

      {sessions.length === 0 ? (
        <p className={styles.info}>{t("childcare.noSessions")}</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t("common.title")}</th>
              <th>{t("common.date")}</th>
              <th>{t("common.time")}</th>
              <th>{t("childcare.pricePerChild")}</th>
              <th>{t("childcare.places")}</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => {
              const isFull = s.availablePlaces !== undefined && s.availablePlaces <= 0;

              return (
                <tr key={s.id}>
                  <td>{s.title}</td>
                  <td>{s.sessionDate}</td>
                  <td>
                    {s.startTime} - {s.endTime}
                  </td>
                  <td>{s.pricePerChild} €</td>
                  <td>
                    {s.availablePlaces !== undefined ? (
                      <span className={isFull ? styles.full : styles.available}>
                        {s.capacity - s.availablePlaces} / {s.capacity}
                      </span>
                    ) : (
                      `0 / ${s.capacity}`
                    )}
                  </td>
                  <td>
                    {user ? (
                      isFull ? (
                        <span className={styles.fullText}>{t("childcare.full")}</span>
                      ) : (
                        <Link to={`/garderie/reserve/${s.id}`} className={styles.primaryLink}>
                          {t("childcare.reserve")}
                        </Link>
                      )
                    ) : (
                      <Link to="/login" className={styles.primaryLink}>
                        {t("nav.login")}
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
