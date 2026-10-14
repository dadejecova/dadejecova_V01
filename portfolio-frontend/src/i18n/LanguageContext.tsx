'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from './locales/en.json';
import es from './locales/es.json';

type Language = 'en' | 'es';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string) => string;
}

const translations: Record<Language, any> = { en, es };

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language from localStorage and override fetch on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    let initialLang: Language = 'en';
    if (savedLang === 'en' || savedLang === 'es') {
      initialLang = savedLang;
      setTimeout(() => setLanguageState(savedLang), 0);
    } else {
      // Fallback to browser language if available
      const browserLang = navigator.language.slice(0, 2);
      if (browserLang === 'es') {
        initialLang = 'es';
        setLanguageState('es');
      }
    }

    // Override fetch globally to automatically append Accept-Language header
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch;
      window.fetch = async function (input, init) {
        const currentLang = localStorage.getItem('language') || initialLang;
        const initHeaders = init?.headers ? new Headers(init.headers) : new Headers();
        
        if (!initHeaders.has('Accept-Language')) {
          initHeaders.set('Accept-Language', currentLang);
        }
        
        return originalFetch(input, {
          ...init,
          headers: initHeaders
        });
      };
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // Also save as a cookie to support django i18n middleware if needed
    document.cookie = `django_language=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  };

  // Translation helper resolving nested keys (e.g. "navbar.dashboard")
  const t = (keyPath: string): string => {
    const keys = keyPath.split('.');
    let current = translations[language];
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English value if key is missing in active language
        let fallback = translations['en'];
        for (const fKey of keys) {
          if (fallback && typeof fallback === 'object' && fKey in fallback) {
            fallback = fallback[fKey];
          } else {
            fallback = keyPath; // Ultimate fallback is the path itself
          }
        }
        return typeof fallback === 'string' ? fallback : keyPath;
      }
    }
    
    return typeof current === 'string' ? current : keyPath;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
