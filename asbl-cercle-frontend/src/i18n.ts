import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  fr: {
    translation: {
      'header.title': 'Plateforme ASBL CERCLE',
      'header.subtitle': 'Gestion des réservations, événements et garderie',
      'home.welcome': 'Bienvenue sur la plateforme de l’ASBL CERCLE',
      'home.description':
        'Réservez des espaces, inscrivez-vous aux événements et gérez vos garderies en ligne.',
      'home.cta': 'Voir les espaces disponibles',
      'error.404': 'Page non trouvée',
    },
  },
  en: {
    translation: {
      'header.title': 'ASBL CERCLE Platform',
      'header.subtitle': 'Manage bookings, events and childcare',
      'home.welcome': 'Welcome to the ASBL CERCLE platform',
      'home.description':
        'Book spaces, register for events and manage childcare online.',
      'home.cta': 'View available spaces',
      'error.404': 'Page not found',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr', // FR par défaut
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
