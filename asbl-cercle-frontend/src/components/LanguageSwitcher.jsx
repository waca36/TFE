import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const current = i18n.language && i18n.language.startsWith('fr') ? 'fr' : 'en';
  const next = current === 'fr' ? 'en' : 'fr';

  // Texte affiché sur le bouton = langue vers laquelle on va basculer
  const label = next === 'fr' ? 'FR' : 'ENG';

  const handleClick = () => {
    i18n.changeLanguage(next);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        padding: '4px 10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '0.9rem',
        cursor: 'pointer',
        backgroundColor: 'white',
      }}
    >
      {label}
    </button>
  );
}
