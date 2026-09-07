import { createContext, useContext, useMemo, useState } from "react";

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  // French is the default language
  const [language, setLanguage] = useState("fr");

  const toggleLanguage = () => {
    setLanguage((current) =>
      current === "fr" ? "en" : "fr"
    );
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,

      isFrench: language === "fr",
      isEnglish: language === "en",
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
};

// =========================================================
// DATABASE LANGUAGE HELPER
// =========================================================
//
// Example:
// getLocalized(item, "title", "fr")
// → item.title_fr
//
// getLocalized(item, "title", "en")
// → item.title_en
// =========================================================

export const getLocalized = (
  item,
  field,
  language,
  fallback = ""
) => {
  if (!item) return fallback;

  const localizedValue = item[`${field}_${language}`];

  if (
    localizedValue !== undefined &&
    localizedValue !== null &&
    localizedValue !== ""
  ) {
    return localizedValue;
  }

  // Fallback to French if English content is missing
  const frenchValue = item[`${field}_fr`];

  if (
    frenchValue !== undefined &&
    frenchValue !== null &&
    frenchValue !== ""
  ) {
    return frenchValue;
  }

  return fallback;
};