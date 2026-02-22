import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const SCRIPT_BY_LANG: Record<string, string> = {
  en: "latin",
  es: "latin",
  fr: "latin",
  de: "latin",
  it: "latin",
  pt: "latin",
  nl: "latin",
  tr: "latin",
  vi: "latin",
  ru: "latin",
  ar: "arabic",
  hi: "devanagari",
  mr: "devanagari",
  ne: "devanagari",
  or: "devanagari",
  bn: "bengali",
  ta: "tamil",
  te: "telugu",
  gu: "devanagari",
  pa: "gurmukhi",
  kn: "kannada",
  ml: "malayalam",
  ja: "japanese",
  ko: "korean",
  zh: "latin",
  th: "thai",
};

export function LanguageFontSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language || "en";
    const script = SCRIPT_BY_LANG[lang] || "latin";
    const isRTL = lang === "ar";

    const root = document.documentElement;
    root.setAttribute("lang", lang);
    root.setAttribute("dir", isRTL ? "rtl" : "ltr");
    root.setAttribute("data-script", script);
  }, [i18n.language]);

  return null;
}
