import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import homeFeaturesEn from "./locales/home-features-howitworks-footer-en.json";
import homeFeaturesHi from "./locales/home-features-howitworks-footer-hi.json";
import homeFeaturesOr from "./locales/home-features-howitworks-footer-or.json";
import homeFeaturesAr from "./locales/home-features-howitworks-footer-ar.json";
import homeFeaturesBn from "./locales/home-features-howitworks-footer-bn.json";
import homeFeaturesDe from "./locales/home-features-howitworks-footer-de.json";
import homeFeaturesEs from "./locales/home-features-howitworks-footer-es.json";
import homeFeaturesFr from "./locales/home-features-howitworks-footer-fr.json";
import homeFeaturesGu from "./locales/home-features-howitworks-footer-gu.json";
import homeFeaturesIt from "./locales/home-features-howitworks-footer-it.json";
import homeFeaturesJa from "./locales/home-features-howitworks-footer-ja.json";
import homeFeaturesKn from "./locales/home-features-howitworks-footer-kn.json";
import homeFeaturesKo from "./locales/home-features-howitworks-footer-ko.json";
import homeFeaturesMl from "./locales/home-features-howitworks-footer-ml.json";
import homeFeaturesMr from "./locales/home-features-howitworks-footer-mr.json";
import homeFeaturesNl from "./locales/home-features-howitworks-footer-nl.json";
import homeFeaturesPa from "./locales/home-features-howitworks-footer-pa.json";
import homeFeaturesPt from "./locales/home-features-howitworks-footer-pt.json";
import homeFeaturesRu from "./locales/home-features-howitworks-footer-ru.json";
import homeFeaturesTa from "./locales/home-features-howitworks-footer-ta.json";
import homeFeaturesTe from "./locales/home-features-howitworks-footer-te.json";
import homeFeaturesTh from "./locales/home-features-howitworks-footer-th.json";
import homeFeaturesTr from "./locales/home-features-howitworks-footer-tr.json";
import homeFeaturesVi from "./locales/home-features-howitworks-footer-vi.json";
import homeFeaturesZh from "./locales/home-features-howitworks-footer-zh.json";
import hi from "./locales/hi.json";
import ar from "./locales/ar.json";
import bn from "./locales/bn.json";
import de from "./locales/de.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import gu from "./locales/gu.json";
import it from "./locales/it.json";
import ja from "./locales/ja.json";
import kn from "./locales/kn.json";
import ko from "./locales/ko.json";
import ml from "./locales/ml.json";
import mr from "./locales/mr.json";
import nl from "./locales/nl.json";
import or from "./locales/or.json";
import pa from "./locales/pa.json";
import pt from "./locales/pt.json";
import ru from "./locales/ru.json";
import ta from "./locales/ta.json";
import te from "./locales/te.json";
import th from "./locales/th.json";
import tr from "./locales/tr.json";
import vi from "./locales/vi.json";
import zh from "./locales/zh.json";

// Merge order: English base first, then locale, then locale-specific home/features/howItWorks/footer override where it exists
const resources = {
  en: { translation: { ...homeFeaturesEn, ...en } },
  hi: { translation: { ...homeFeaturesEn, ...hi, ...homeFeaturesHi } },
  or: { translation: { ...homeFeaturesEn, ...or, ...homeFeaturesOr } },
  gu: { translation: { ...homeFeaturesEn, ...gu, ...homeFeaturesGu } },
  bn: { translation: { ...homeFeaturesEn, ...bn, ...homeFeaturesBn } },
  ta: { translation: { ...homeFeaturesEn, ...ta, ...homeFeaturesTa } },
  te: { translation: { ...homeFeaturesEn, ...te, ...homeFeaturesTe } },
  mr: { translation: { ...homeFeaturesEn, ...mr, ...homeFeaturesMr } },
  ml: { translation: { ...homeFeaturesEn, ...ml, ...homeFeaturesMl } },
  kn: { translation: { ...homeFeaturesEn, ...kn, ...homeFeaturesKn } },
  pa: { translation: { ...homeFeaturesEn, ...pa, ...homeFeaturesPa } },
  ar: { translation: { ...homeFeaturesEn, ...ar, ...homeFeaturesAr } },
  de: { translation: { ...homeFeaturesEn, ...de, ...homeFeaturesDe } },
  es: { translation: { ...homeFeaturesEn, ...es, ...homeFeaturesEs } },
  fr: { translation: { ...homeFeaturesEn, ...fr, ...homeFeaturesFr } },
  it: { translation: { ...homeFeaturesEn, ...it, ...homeFeaturesIt } },
  ja: { translation: { ...homeFeaturesEn, ...ja, ...homeFeaturesJa } },
  ko: { translation: { ...homeFeaturesEn, ...ko, ...homeFeaturesKo } },
  nl: { translation: { ...homeFeaturesEn, ...nl, ...homeFeaturesNl } },
  pt: { translation: { ...homeFeaturesEn, ...pt, ...homeFeaturesPt } },
  ru: { translation: { ...homeFeaturesEn, ...ru, ...homeFeaturesRu } },
  tr: { translation: { ...homeFeaturesEn, ...tr, ...homeFeaturesTr } },
  vi: { translation: { ...homeFeaturesEn, ...vi, ...homeFeaturesVi } },
  th: { translation: { ...homeFeaturesEn, ...th, ...homeFeaturesTh } },
  zh: { translation: { ...homeFeaturesEn, ...zh, ...homeFeaturesZh } },
};

const supportedLngs = Object.keys(resources);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "medisense_lang",
    },
  });

export default i18n;
