import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicEvents } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import styles from "./EventsPage.module.css";

const EURO = "€";

const getDateLocale = (lang) => {
  const locales = { fr: "fr-BE", nl: "nl-BE", en: "en-GB" };
  return locales[lang] || "fr-BE";
};

const formatRange = (startIso, endIso, t, locale) => {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const dateOptions = { day: "2-digit", month: "2-digit", year: "numeric" };
  const timeOptions = { hour: "2-digit", minute: "2-digit" };

  const day = start.toLocaleDateString(locale, dateOptions);
  const startTime = start.toLocaleTimeString(locale, timeOptions);
  const endTime = end.toLocaleTimeString(locale, timeOptions);

  if (sameDay) {
    return `${day} ${t("common.from").toLowerCase()} ${startTime} ${t("common.to").toLowerCase()} ${endTime}`;
  }
  const endDay = end.toLocaleDateString(locale, dateOptions);
  return `${t("common.from")} ${day} ${startTime} ${t("common.to").toLowerCase()} ${endDay} ${endTime}`;
};

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [priceFilter, setPriceFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [childcareFilter, setChildcareFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const locale = getDateLocale(i18n.language);

  useEffect(() => {
    getPublicEvents()
      .then(setEvents)
      .catch(console.error);
  }, []);

  const hasActiveFilters = priceFilter !== "all" || availabilityFilter !== "all" || childcareFilter !== "all" || searchQuery !== "";

  const resetFilters = () => {
    setPriceFilter("all");
    setAvailabilityFilter("all");
    setChildcareFilter("all");
    setSearchQuery("");
    setSortBy("date");
  };

  const filteredAndSortedEvents = events
    .filter((ev) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = ev.title?.toLowerCase().includes(query);
        const matchesDescription = ev.description?.toLowerCase().includes(query);
        const matchesLocation = ev.location?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription && !matchesLocation) return false;
      }

      if (priceFilter === "free" && (ev.price && ev.price > 0)) return false;
      if (priceFilter === "paid" && (!ev.price || ev.price === 0)) return false;

      const isFull = ev.availablePlaces !== null && ev.availablePlaces !== undefined && ev.availablePlaces <= 0;
      if (availabilityFilter === "available" && isFull) return false;
      if (availabilityFilter === "full" && !isFull) return false;

      if (childcareFilter === "with" && !ev.garderieSessionId) return false;
      if (childcareFilter === "without" && ev.garderieSessionId) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.startDateTime) - new Date(b.startDateTime);
      }
      if (sortBy === "dateDesc") {
        return new Date(b.startDateTime) - new Date(a.startDateTime);
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
      if (sortBy === "capacityAsc") {
        return a.capacity - b.capacity;
      }
      if (sortBy === "capacityDesc") {
        return b.capacity - a.capacity;
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
        <div className={styles.filtersTop}>
          <div className={styles.searchGroup}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={t("events.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.sortGroup}>
            <label className={styles.filterLabel}>{t("events.sortBy")}</label>
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">{t("events.sortByDateAsc")}</option>
              <option value="dateDesc">{t("events.sortByDateDesc")}</option>
              <option value="priceAsc">{t("events.sortByPriceAsc")}</option>
              <option value="priceDesc">{t("events.sortByPriceDesc")}</option>
              <option value="capacityAsc">{t("events.sortByCapacityAsc")}</option>
              <option value="capacityDesc">{t("events.sortByCapacityDesc")}</option>
            </select>
          </div>
        </div>

        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{t("events.filterByPrice")}</label>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterButton} ${priceFilter === "all" ? styles.active : ""}`}
                onClick={() => setPriceFilter("all")}
              >
                {t("common.all")}
              </button>
              <button
                className={`${styles.filterButton} ${priceFilter === "free" ? styles.active : ""}`}
                onClick={() => setPriceFilter("free")}
              >
                {t("events.free")}
              </button>
              <button
                className={`${styles.filterButton} ${priceFilter === "paid" ? styles.active : ""}`}
                onClick={() => setPriceFilter("paid")}
              >
                {t("events.paid")}
              </button>
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{t("events.filterByAvailability")}</label>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterButton} ${availabilityFilter === "all" ? styles.active : ""}`}
                onClick={() => setAvailabilityFilter("all")}
              >
                {t("common.all")}
              </button>
              <button
                className={`${styles.filterButton} ${availabilityFilter === "available" ? styles.active : ""}`}
                onClick={() => setAvailabilityFilter("available")}
              >
                {t("events.availableOnly")}
              </button>
              <button
                className={`${styles.filterButton} ${availabilityFilter === "full" ? styles.active : ""}`}
                onClick={() => setAvailabilityFilter("full")}
              >
                {t("events.fullOnly")}
              </button>
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>{t("events.filterByChildcare")}</label>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterButton} ${childcareFilter === "all" ? styles.active : ""}`}
                onClick={() => setChildcareFilter("all")}
              >
                {t("common.all")}
              </button>
              <button
                className={`${styles.filterButton} ${childcareFilter === "with" ? styles.active : ""}`}
                onClick={() => setChildcareFilter("with")}
              >
                {t("events.withChildcare")}
              </button>
              <button
                className={`${styles.filterButton} ${childcareFilter === "without" ? styles.active : ""}`}
                onClick={() => setChildcareFilter("without")}
              >
                {t("events.withoutChildcare")}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.filtersFooter}>
          <span className={styles.resultsCount}>
            {filteredAndSortedEvents.length} {filteredAndSortedEvents.length === 1 ? t("events.eventFound") : t("events.eventsFound")}
          </span>
          {hasActiveFilters && (
            <button className={styles.resetButton} onClick={resetFilters}>
              {t("events.resetFilters")}
            </button>
          )}
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
                  <p className={styles.date}>{formatRange(ev.startDateTime, ev.endDateTime, t, locale)}</p>
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
                    {ev.availablePlaces !== null && ev.availablePlaces !== undefined ? ev.capacity - ev.availablePlaces : 0} / {ev.capacity} {t("common.persons")}
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
