import 'react-i18next';
import landing from '../locales/de/landing.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'landing';
    resources: {
      landing: typeof landing;
    };
  }
}
