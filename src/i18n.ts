import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import zh from "./locales/zh.json";

import ja from "./locales/ja.json";

const pathLang = window.location.pathname.split("/")[1];

const initialLang =
  pathLang === "zh" || pathLang === "en" ? pathLang : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
    ja: { translation: ja }
  },
  lng: "en",

  fallbackLng: "en",

  supportedLngs: ["en", "zh", "ja"],

  interpolation: {

    escapeValue: false

  }

});

export default i18n;