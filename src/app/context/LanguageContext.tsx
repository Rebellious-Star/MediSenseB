import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { getTranslations, type Translations } from "../translations";

const STORAGE_KEY = "medisense-language";

export const SUPPORTED_LANGUAGES = [
  { code: "EN", name: "English" },
  { code: "HI", name: "हिंदी (Hindi)" },
  { code: "OD", name: "ଓଡ଼ିଆ (Odia)" },
  { code: "BN", name: "বাংলা (Bengali)" },
  { code: "TE", name: "తెలుగు (Telugu)" },
  { code: "MR", name: "मराठी (Marathi)" },
  { code: "TA", name: "தமிழ் (Tamil)" },
  { code: "GU", name: "ગુજરાતી (Gujarati)" },
  { code: "KN", name: "ಕನ್ನಡ (Kannada)" },
  { code: "ML", name: "മലയാളം (Malayalam)" },
  { code: "PA", name: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "ES", name: "Español" },
  { code: "FR", name: "Français" },
  { code: "DE", name: "Deutsch" },
  { code: "ZH", name: "中文 (Chinese)" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (key: string) => string;
  translations: Translations;
};

const defaultContext: LanguageContextValue = {
  language: "EN",
  setLanguage: () => {},
  t: (key: string) => key,
  translations: getTranslations("EN"),
};

const LanguageContext = createContext<LanguageContextValue>(defaultContext);

function getStoredLanguage(): LanguageCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
    if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) return stored;
  } catch {}
  return "EN";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(getStoredLanguage);
  const translations = getTranslations(language);

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {}
  }, []);

  useEffect(() => {
    setLanguageState(getStoredLanguage());
  }, []);

  const t = useCallback(
    (key: string): string => {
      const value = key.split(".").reduce((obj: unknown, k) => (obj as Record<string, unknown>)?.[k], translations as unknown);
      return (typeof value === "string" ? value : key) || key;
    },
    [translations]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

export function useTranslation() {
  return useLanguage();
}
