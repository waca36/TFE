import { useEffect, useState } from "react";
import { getEspaces } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function EspacesPage() {
  const { user } = useAuth();
  const [espaces, setEspaces] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    getEspaces().then(setEspaces);
  }, []);

  return (
    <div>
      <h1>{t('spaces.title')}</h1>
      {user && <p>{t('spaces.welcome')} {user.firstName}</p>}
      <hr />

      {espaces.length === 0 && <p>{t('spaces.noSpaces')}</p>}

      {espaces.map((e) => (
        <div key={e.id} style={styles.card}>
          <h3>{e.name}</h3>
          <p>{t('common.type')} : {e.type}</p>
          <p>{t('common.capacity')} : {e.capacity} {t('common.persons')}</p>
          <p>{t('common.price')} : {e.basePrice} € {t('common.perHour')}</p>
          <Link to={`/reservations/new/${e.id}`} style={styles.link}>
            {t('spaces.reserve')}
          </Link>
        </div>
      ))}
    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    padding: "1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "500",
  },
};
