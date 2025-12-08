import { useTranslation } from "react-i18next";
import styles from "./LanguageSwitcher.module.css";

const languages = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "nl", label: "NL" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const getCurrentLang = () => {
    const lang = i18n.language;
    if (lang?.startsWith("fr")) return "fr";
    if (lang?.startsWith("nl")) return "nl";
    return "en";
  };

  const handleChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <select value={getCurrentLang()} onChange={handleChange} className={styles.select}>
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}
