import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { adminGetEspaces, adminDeleteEspace } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [espaces, setEspaces] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }

    adminGetEspaces(token)
      .then(setEspaces)
      .catch((err) => setError(err.message));
  }, [user, token, navigate]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.confirmDeleteSpace'))) return;
    try {
      await adminDeleteEspace(id, token);
      setEspaces((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div>
      <h1>{t('admin.dashboard')}</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <p>
        <Link to="/admin/events">{t('admin.eventsManagement')}</Link>
      </p>

      <p>
        <Link to="/admin/garderie">{t('admin.childcareManagement')}</Link>
      </p>

      <div style={{ marginBottom: "1rem", marginTop: "1.5rem" }}>
        <Link to="/admin/espaces/new">+ {t('admin.createSpace')}</Link>
      </div>

      <table border="1" cellPadding="6" style={styles.table}>
        <thead>
          <tr>
            <th>{t('admin.name')}</th>
            <th>{t('common.type')}</th>
            <th>{t('common.capacity')}</th>
            <th>{t('common.price')}</th>
            <th>{t('common.status')}</th>
            <th>{t('common.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {espaces.map((e) => (
            <tr key={e.id}>
              <td>{e.name}</td>
              <td>{e.type}</td>
              <td>{e.capacity}</td>
              <td>{e.basePrice} €</td>
              <td>{t(`status.${e.status.toLowerCase()}`)}</td>
              <td>
                <Link to={`/admin/espaces/${e.id}/edit`}>{t('common.edit')}</Link>{" "}
                |{" "}
                <button onClick={() => handleDelete(e.id)}>
                  {t('common.delete')}
                </button>
              </td>
            </tr>
          ))}
          {espaces.length === 0 && (
            <tr>
              <td colSpan="6">{t('admin.noSpaces')}</td>
            </tr>
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
