import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { LOCALE_STRINGS } from './localeStrings';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n.use(new LanguageDetector({}, {caches:[]}))
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      resources: {...LOCALE_STRINGS},
      // debug: process.env.NODE_ENV && process.env.NODE_ENV === 'development',
      detection: {
        order: ['cookie', 'localStorage'],
      },
      interpolation: {
        escapeValue: false, // not needed for react as it escapes by default
      }
    });
    
export default i18n;