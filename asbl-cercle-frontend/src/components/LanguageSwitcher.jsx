import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'nl', label: 'NL' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const getCurrentLang = () => {
    const lang = i18n.language;
    if (lang?.startsWith('fr')) return 'fr';
    if (lang?.startsWith('nl')) return 'nl';
    return 'en';
  };

  const handleChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <select
      value={getCurrentLang()}
      onChange={handleChange}
      style={styles.select}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}

const styles = {
  select: {
    padding: "0.3rem 0.5rem",
    borderRadius: "4px",
    border: "1px solid #9ca3af",
    fontSize: "0.85rem",
    cursor: "pointer",
    backgroundColor: "#374151",
    color: "#f9fafb",
    fontWeight: "500",
  },
};
