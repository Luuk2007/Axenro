
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { englishTranslations } from '../translations/english';
import { dutchTranslations } from '../translations/dutch';
import { DomainTranslations } from '../translations/types';

// Define the type for translations
export type TranslationKeys = string;

// Define languages available
export type Language = 'english' | 'dutch';

// Translation object maps by language
const translations: Record<Language, DomainTranslations> = {
  english: englishTranslations,
  dutch: dutchTranslations
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Detect domain-based language
  const getDomainBasedLanguage = (): Language => {
    const hostname = window.location.hostname;
    if (hostname === 'axenro.nl') {
      return 'dutch';
    }
    return 'english'; // Default for axenro.com and other domains
  };

  // Get saved language from localStorage or use domain-based detection
  const getSavedLanguage = (): Language => {
    // First check if we should use domain-based language
    const domainLanguage = getDomainBasedLanguage();
    
    // If it's a domain-specific URL, use that language
    if (window.location.hostname === 'axenro.nl' || window.location.hostname === 'axenro.com') {
      return domainLanguage;
    }
    
    // Otherwise, check localStorage
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

  // Set title based on language and domain
  const updateTitle = (lang: Language) => {
    if (lang === 'dutch') {
      document.title = 'Axenro | jouw persoonlijke gezondheidstracker';
    } else {
      document.title = 'Axenro | your personal health tracker';
    }
  };

  // Apply theme on initial load and set initial title
  useEffect(() => {
    const theme = getSavedTheme();
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Set initial title based on language
    updateTitle(language);
  }, []);

  // Update localStorage whenever language changes (but not for domain-based routing)
  useEffect(() => {
    const hostname = window.location.hostname;
    const isDomainSpecific = hostname === 'axenro.nl' || hostname === 'axenro.com';
    
    // Only save to localStorage if it's not a domain-specific URL
    if (!isDomainSpecific) {
      const savedSettings = localStorage.getItem("userSettings");
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      localStorage.setItem("userSettings", JSON.stringify({
        ...settings,
        language
      }));
    }
    
    // Update title when language changes
    updateTitle(language);
    
    // Force a re-render of the entire application
    document.documentElement.setAttribute('lang', language);
    
    // Trigger a custom event to notify components of language change
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { language } }));
  }, [language]);

  // Translation function - simplified to use common translations
  const t = (key: TranslationKeys): string => {
    const translation = translations[language];
    const commonTranslations = translation.common as Record<string, string>;
    return commonTranslations[key] || (translations.english.common as Record<string, string>)[key] || key;
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
