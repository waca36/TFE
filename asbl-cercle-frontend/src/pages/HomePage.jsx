import React from 'react';
import { useTranslation } from 'react-i18next';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <main style={{ padding: '2rem' }}>
      <h1>{t('home.welcome')}</h1>
      <p style={{ marginTop: '1rem', maxWidth: '600px' }}>
        {t('home.description')}
      </p>
      <button
        style={{
          marginTop: '1.5rem',
          padding: '0.6rem 1.2rem',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {t('home.cta')}
      </button>
    </main>
  );
}
