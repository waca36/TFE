import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyProfile, updateMyProfile, changeMyPassword } from "../services/api";

export default function ProfilePage() {
  const { user, token, login } = useAuth();

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdError, setPwdError] = useState("");

  useEffect(() => {
    if (token) {
      getMyProfile(token)
        .then((data) => {
          setProfile({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
          });
        })
        .catch(console.error);
    }
  }, [token]);

  const submitProfile = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    try {
      const updated = await updateMyProfile(profile, token);
      setMsg("Profil mis à jour avec succès");

      // on met à jour le user dans le contexte pour refléter les changements
      if (user) {
        login(
          {
            ...user,
            firstName: updated.firstName,
            lastName: updated.lastName,
            email: updated.email,
          },
          token
        );
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setPwdMsg("");
    setPwdError("");

    if (newPassword !== newPassword2) {
      setPwdError("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    try {
      await changeMyPassword(
        {
          currentPassword,
          newPassword,
        },
        token
      );
      setPwdMsg("Mot de passe mis à jour");
      setCurrentPassword("");
      setNewPassword("");
      setNewPassword2("");
    } catch (err) {
      setPwdError(err.message);
    }
  };

  if (!user) {
    return <p>Veuillez vous connecter pour accéder à votre profil.</p>;
  }

  return (
    <div>
      <h1>Mon profil</h1>

      <h2>Informations personnelles</h2>
      <form onSubmit={submitProfile}>
        <div>
          <label>Prénom :</label><br />
          <input
            value={profile.firstName}
            onChange={(e) =>
              setProfile({ ...profile, firstName: e.target.value })
            }
          />
        </div>

        <div>
          <label>Nom :</label><br />
          <input
            value={profile.lastName}
            onChange={(e) =>
              setProfile({ ...profile, lastName: e.target.value })
            }
          />
        </div>

        <div>
          <label>Email :</label><br />
          <input
            type="email"
            value={profile.email}
            onChange={(e) =>
              setProfile({ ...profile, email: e.target.value })
            }
          />
        </div>

        {msg && <p style={{ color: "green" }}>{msg}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <button style={{ marginTop: "1rem" }}>Enregistrer les modifications</button>
      </form>

      <hr style={{ margin: "2rem 0" }} />

      <h2>Changer mon mot de passe</h2>
      <form onSubmit={submitPassword}>
        <div>
          <label>Mot de passe actuel :</label><br />
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div>
          <label>Nouveau mot de passe :</label><br />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div>
          <label>Confirmer le nouveau mot de passe :</label><br />
          <input
            type="password"
            value={newPassword2}
            onChange={(e) => setNewPassword2(e.target.value)}
          />
        </div>

        {pwdMsg && <p style={{ color: "green" }}>{pwdMsg}</p>}
        {pwdError && <p style={{ color: "red" }}>{pwdError}</p>}

        <button style={{ marginTop: "1rem" }}>Changer le mot de passe</button>
      </form>
    </div>
  );
}
