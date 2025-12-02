import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyProfile, updateMyProfile, changeMyPassword } from "../services/api";
import { useTranslation } from "react-i18next";

export default function ProfilePage() {
  const { user, token, login } = useAuth();
  const { t } = useTranslation();

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
      setMsg(t('profile.updateSuccess'));

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
      setPwdError(t('profile.passwordMismatch'));
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
      setPwdMsg(t('profile.passwordUpdated'));
      setCurrentPassword("");
      setNewPassword("");
      setNewPassword2("");
    } catch (err) {
      setPwdError(err.message);
    }
  };

  if (!user) {
    return <p>{t('profile.notLoggedIn')}</p>;
  }

  return (
    <div style={styles.container}>
      <h1>{t('profile.title')}</h1>

      <div style={styles.section}>
        <h2>{t('profile.personalInfo')}</h2>
        <form onSubmit={submitProfile}>
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('auth.firstName')} :</label>
            <input
              value={profile.firstName}
              onChange={(e) =>
                setProfile({ ...profile, firstName: e.target.value })
              }
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>{t('auth.lastName')} :</label>
            <input
              value={profile.lastName}
              onChange={(e) =>
                setProfile({ ...profile, lastName: e.target.value })
              }
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>{t('auth.email')} :</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button}>{t('common.save')}</button>
        </form>

        {msg && <p style={styles.success}>{msg}</p>}
        {error && <p style={styles.error}>{error}</p>}
      </div>

      <div style={styles.section}>
        <h2>{t('profile.changePassword')}</h2>
        <form onSubmit={submitPassword}>
          <div style={styles.formGroup}>
            <label style={styles.label}>{t('profile.currentPassword')} :</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>{t('profile.newPassword')} :</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>{t('profile.confirmPassword')} :</label>
            <input
              type="password"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button}>{t('common.save')}</button>
        </form>

        {pwdMsg && <p style={styles.success}>{pwdMsg}</p>}
        {pwdError && <p style={styles.error}>{pwdError}</p>}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "500px",
    margin: "0 auto",
  },
  section: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "8px",
    marginBottom: "1.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  formGroup: {
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "1rem",
    boxSizing: "border-box",
  },
  button: {
    padding: "0.75rem 1.5rem",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  success: {
    color: "#059669",
    marginTop: "1rem",
  },
  error: {
    color: "#dc2626",
    marginTop: "1rem",
  },
};
