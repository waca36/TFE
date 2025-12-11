import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicEvents } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import styles from "./EventsPage.module.css";

const EURO = "€";

const formatRange = (startIso, endIso) => {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const pad = (n) => n.toString().padStart(2, "0");
  const day = `${pad(start.getDate())}/${pad(start.getMonth() + 1)}/${start.getFullYear()}`;
  const startTime = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
  const endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}`;

  if (sameDay) {
    return `Le ${day} de ${startTime} à ${endTime}`;
  }
  const endDay = `${pad(end.getDate())}/${pad(end.getMonth() + 1)}/${end.getFullYear()}`;
  return `Du ${day} ${startTime} au ${endDay} ${endTime}`;
};

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    getPublicEvents()
      .then(setEvents)
      .catch(console.error);
  }, []);

  const filteredAndSortedEvents = events
    .filter((ev) => {
      if (priceFilter === "all") return true;
      if (priceFilter === "free") return !ev.price || ev.price === 0;
      if (priceFilter === "paid") return ev.price && ev.price > 0;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.startDateTime) - new Date(b.startDateTime);
      }
      if (sortBy === "priceAsc") {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        return priceA - priceB;
      }
      if (sortBy === "priceDesc") {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        return priceB - priceA;
      }
      return 0;
    });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.kicker}>Cercle • Programme à venir</p>
          <h1 className={styles.title}>{t("events.title")}</h1>
        </div>
        <div>
          {user ? (
            <Link to="/my-reservations?tab=events" className={styles.linkGhost}>
              ← {t("events.viewMyRegistrations")}
            </Link>
          ) : (
            <Link to="/login" className={styles.linkGhost}>
              {t("events.loginToRegister")}
            </Link>
          )}
        </div>
      </div>

      <div className={styles.filtersBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>{t("events.filterByPrice")}</label>
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterButton} ${priceFilter === "all" ? styles.active : ""}`}
              onClick={() => setPriceFilter("all")}
            >
              {t("events.allEvents")}
            </button>
            <button
              className={`${styles.filterButton} ${priceFilter === "free" ? styles.active : ""}`}
              onClick={() => setPriceFilter("free")}
            >
              {t("events.freeEvents")}
            </button>
            <button
              className={`${styles.filterButton} ${priceFilter === "paid" ? styles.active : ""}`}
              onClick={() => setPriceFilter("paid")}
            >
              {t("events.paidEvents")}
            </button>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>{t("events.sortBy")}</label>
          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">{t("events.sortByDate")}</option>
            <option value="priceAsc">{t("events.sortByPriceAsc")}</option>
            <option value="priceDesc">{t("events.sortByPriceDesc")}</option>
          </select>
        </div>
      </div>

      {filteredAndSortedEvents.length === 0 && <p className={styles.empty}>{t("events.noEvents")}</p>}

      <div className={styles.grid}>
        {filteredAndSortedEvents.map((ev) => {
          const isFull = ev.availablePlaces !== null && ev.availablePlaces !== undefined && ev.availablePlaces <= 0;

          return (
            <div key={ev.id} className={`${styles.card} ${isFull ? styles.cardFull : ""}`}>
              <div className={styles.cardHeader}>
                <div>
                  <p className={styles.date}>{formatRange(ev.startDateTime, ev.endDateTime)}</p>
                  <h2 className={styles.cardTitle}>{ev.title}</h2>
                </div>
                <div className={styles.tags}>
                  {isFull && <span className={`${styles.tag} ${styles.tagFull}`}>{t("events.full")}</span>}
                  {ev.garderieSessionId && <span className={`${styles.tag} ${styles.tagGarderie}`}>{t("events.childcareAvailable")}</span>}
                  {ev.price && ev.price > 0 ? (
                    <span className={`${styles.tag} ${styles.tagPricePaid}`}>{ev.price} {EURO}</span>
                  ) : (
                    <span className={`${styles.tag} ${styles.tagPriceFree}`}>{t("events.free")}</span>
                  )}
                </div>
              </div>

              <p className={styles.desc}>{ev.description}</p>

              <div className={styles.metaRow}>
                <div className={styles.meta}>
                  <span className={styles.metaLabel}>{t("common.location")}</span>
                  <span className={styles.metaValue}>{ev.location || t("common.toBeAnnounced")}</span>
                </div>
                <div className={styles.meta}>
                  <span className={styles.metaLabel}>{t("common.capacity")}</span>
                  <span className={`${styles.capacity} ${isFull ? styles.capacityFull : ""}`}>
                    {ev.availablePlaces ?? ev.capacity} / {ev.capacity} {t("common.persons")}
                  </span>
                </div>
              </div>

              <div className={styles.actions}>
                {isFull ? (
                  <span className={styles.buttonDisabled}>
                    {t("events.full")}
                  </span>
                ) : user ? (
                  <Link to={`/events/register/${ev.id}`} className={styles.button}>
                    {t("events.register")}
                  </Link>
                ) : (
                  <Link to="/login" className={styles.buttonSecondary}>
                    {t("events.loginToRegister")}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
