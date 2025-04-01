
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import english from '../translations/english';
import { dutch } from '../translations/dutch';
import { french } from '../translations/french';
import { german } from '../translations/german';
import { spanish } from '../translations/spanish';

// Define the type for translations using the imported english object
export type TranslationKeys = keyof typeof english | keyof typeof dutch | keyof typeof french | keyof typeof german | keyof typeof spanish;

// Define languages available
export type Language = 'english' | 'dutch' | 'french' | 'german' | 'spanish';

// Translation object maps by language
const translations = {
  english,
  dutch,
  french,
  german,
  spanish
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Get saved language from localStorage or default to English
  const getSavedLanguage = (): Language => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      const { language } = JSON.parse(savedSettings);
      if (language && Object.keys(translations).includes(language)) {
        return language as Language;
      }
    }
    return 'english';
  };

  // Get saved theme from localStorage or default to light
  const getSavedTheme = (): 'light' | 'dark' => {
    const savedSettings = localStorage.getItem("userSettings");
    if (savedSettings) {
      const { theme } = JSON.parse(savedSettings);
      if (theme === 'light' || theme === 'dark') {
        return theme as 'light' | 'dark';
      }
    }
    return 'light';
  };

  const [language, setLanguage] = useState<Language>(getSavedLanguage);

  // Apply theme on initial load
  useEffect(() => {
    const theme = getSavedTheme();
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Update localStorage whenever language changes
  useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    localStorage.setItem("userSettings", JSON.stringify({
      ...settings,
      language
    }));
  }, [language]);

  // Translation function
  const t = (key: TranslationKeys): string => {
    const translation = translations[language];
    return (translation as any)[key] || (english as any)[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use language
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
