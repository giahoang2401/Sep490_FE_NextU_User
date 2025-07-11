import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en/en.json';
import vi from './vi/vi.json';

let lng = "en";
if (typeof window !== "undefined") {
  lng = localStorage.getItem("i18nextLng") || "en";
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi }
    },
    lng,
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;