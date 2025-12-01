import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header style={styles.header}>
      <div>
        <span style={styles.logo}>ASBL CERCLE</span>
      </div>

      <nav style={styles.nav}>
        <Link to="/espace" style={styles.link}>Espaces</Link>
        <Link to="/events" style={styles.link}>Événements</Link>
        <Link to="/reservations" style={styles.link}>Mes réservations</Link>
        {user?.role === "ADMIN" && (
          <Link to="/admin" style={styles.link}>Admin</Link>
        )}
      </nav>


      

      <div>
        {user ? (
          <>
            <span style={{ marginRight: "1rem" }}>
              Bonjour, <b>{user.firstName}</b>
            </span>
            
            <button onClick={handleLogout} style={styles.button}>
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Connexion</Link>
            <Link to="/register" style={styles.link}>Inscription</Link>
            

          </>
        )}
        
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 1.5rem",
    background: "#1f2937",
    color: "#f9fafb",
  },
  logo: {
    fontWeight: "bold",
    letterSpacing: "0.05em",
  },
  nav: {
    display: "flex",
    gap: "1rem",
  },
  link: {
    color: "#e5e7eb",
    textDecoration: "none",
  },
  button: {
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
};
