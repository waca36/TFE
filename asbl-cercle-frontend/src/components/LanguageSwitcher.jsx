import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const currentLang = i18n.language?.startsWith('fr') ? 'fr' : 'en';
  const nextLang = currentLang === 'fr' ? 'en' : 'fr';
  const label = nextLang === 'fr' ? 'FR' : 'ENG';

  const handleClick = () => {
    i18n.changeLanguage(nextLang);
  };

  return (
    <button onClick={handleClick} style={styles.button}>
      {label}
    </button>
  );
}

const styles = {
  button: {
    padding: "0.3rem 0.6rem",
    borderRadius: "4px",
    border: "1px solid #9ca3af",
    fontSize: "0.85rem",
    cursor: "pointer",
    backgroundColor: "#374151",
    color: "#f9fafb",
    fontWeight: "500",
  },
};
