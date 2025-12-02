import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { adminGetEvents, adminDeleteEvent } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AdminEventsDashboard() {
  const { user, token } = useAuth();
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }

    adminGetEvents(token)
      .then(setEvents)
      .catch(console.error);
  }, [user, token, navigate]);

  const del = async (id) => {
    if (!window.confirm(t('admin.confirmDeleteEvent'))) return;
    await adminDeleteEvent(id, token);
    setEvents(events.filter((e) => e.id !== id));
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div>
      <h1>{t('admin.eventsManagement')}</h1>
      
      <p>
        <Link to="/admin">← {t('admin.backToDashboard')}</Link>
        {" | "}
        <Link to="/admin/events/new">+ {t('admin.createEvent')}</Link>
      </p>
      
      <hr />

      <table border="1" cellPadding="6" style={styles.table}>
        <thead>
          <tr>
            <th>{t('common.title')}</th>
            <th>{t('reservation.startDate')}</th>
            <th>{t('reservation.endDate')}</th>
            <th>{t('common.status')}</th>
            <th>{t('common.actions')}</th>
          </tr>
        </thead>

        <tbody>
          {events.map((ev) => (
            <tr key={ev.id}>
              <td>{ev.title}</td>
              <td>{ev.startDateTime.replace("T", " ")}</td>
              <td>{ev.endDateTime.replace("T", " ")}</td>
              <td>{t(`status.${ev.status.toLowerCase()}`)}</td>
              <td>
                <Link to={`/admin/events/${ev.id}/edit`}>{t('common.edit')}</Link>
                {" | "}
                <button onClick={() => del(ev.id)}>{t('common.delete')}</button>
              </td>
            </tr>
          ))}

          {events.length === 0 && (
            <tr><td colSpan="5">{t('admin.noEvents')}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  table: {
    borderCollapse: "collapse",
    width: "100%",
    background: "#fff",
  },
};
