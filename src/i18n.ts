import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import deLanding from './locales/de/landing.json';
import enLanding from './locales/en/landing.json';
import frLanding from './locales/fr/landing.json';
import itLanding from './locales/it/landing.json';

const resources = {
  de: { landing: deLanding },
  en: { landing: enLanding },
  fr: { landing: frLanding },
  it: { landing: itLanding }
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['de', 'en', 'fr', 'it'],
    defaultNS: 'landing',
    ns: ['landing'],
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'smartpack-language'
    },
    interpolation: {
      escapeValue: false
    }
  });

i18n.on('initialized', () => {
  const initialLanguage = i18n.resolvedLanguage ?? i18n.language;
  if (typeof document !== 'undefined' && initialLanguage) {
    document.documentElement.lang = initialLanguage;
  }
});

i18n.on('languageChanged', (lng: string) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
});

export default i18n;
export type AppLanguage = keyof typeof resources;
