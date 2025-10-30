import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import deLanding from './locales/de/landing.json';
import enLanding from './locales/en/landing.json';
import frLanding from './locales/fr/landing.json';
import itLanding from './locales/it/landing.json';
import deAuth from './locales/de/auth.json';
import enAuth from './locales/en/auth.json';
import frAuth from './locales/fr/auth.json';
import itAuth from './locales/it/auth.json';
import deDashboard from './locales/de/dashboard.json';
import enDashboard from './locales/en/dashboard.json';
import frDashboard from './locales/fr/dashboard.json';
import itDashboard from './locales/it/dashboard.json';
import deProfile from './locales/de/profile.json';
import enProfile from './locales/en/profile.json';
import frProfile from './locales/fr/profile.json';
import itProfile from './locales/it/profile.json';
import deSettings from './locales/de/settings.json';
import enSettings from './locales/en/settings.json';
import frSettings from './locales/fr/settings.json';
import itSettings from './locales/it/settings.json';
import deTrips from './locales/de/trips.json';
import enTrips from './locales/en/trips.json';
import frTrips from './locales/fr/trips.json';
import itTrips from './locales/it/trips.json';
import dePwa from './locales/de/pwa.json';
import enPwa from './locales/en/pwa.json';
import frPwa from './locales/fr/pwa.json';
import itPwa from './locales/it/pwa.json';

const resources = {
  de: {
    landing: deLanding,
    auth: deAuth,
    dashboard: { ...deDashboard, ...deTrips, ...deProfile, ...deSettings },
    pwa: dePwa
  },
  en: {
    landing: enLanding,
    auth: enAuth,
    dashboard: { ...enDashboard, ...enTrips, ...enProfile, ...enSettings },
    pwa: enPwa
  },
  fr: {
    landing: frLanding,
    auth: frAuth,
    dashboard: { ...frDashboard, ...frTrips, ...frProfile, ...frSettings },
    pwa: frPwa
  },
  it: {
    landing: itLanding,
    auth: itAuth,
    dashboard: { ...itDashboard, ...itTrips, ...itProfile, ...itSettings },
    pwa: itPwa
  }
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['de', 'en', 'fr', 'it'],
    defaultNS: 'landing',
    ns: ['landing', 'auth', 'dashboard', 'pwa'],
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
