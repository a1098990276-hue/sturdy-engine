import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

i18next
  .use(initReactI18next)
  .init({
    lng: localStorage.getItem('lang') || 'ar',
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    },
    resources: {
      ar: require('./locales/ar.json'),
      en: require('./locales/en.json')
    }
  });
