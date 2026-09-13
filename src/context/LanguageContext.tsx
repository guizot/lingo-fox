'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { UILanguage, TranslationSchema, getTranslation } from '@/lib/i18n';

interface LanguageContextType {
  language: UILanguage;
  setLanguage: (lang: UILanguage) => void;
  t: TranslationSchema;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<UILanguage>('en');

  useEffect(() => {
    try {
      const stored = (localStorage.getItem('lingo_fox_ui_lang') || localStorage.getItem('language_preference')) as UILanguage | null;
      if (stored === 'en' || stored === 'id') {
        setLanguageState(stored);
      } else {
        const browserLang = navigator.language.toLowerCase();
        if (browserLang.startsWith('id')) {
          setLanguageState('id');
        } else {
          setLanguageState('en');
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const setLanguage = useCallback((lang: UILanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('lingo_fox_ui_lang', lang);
      localStorage.setItem('language_preference', lang);
      document.documentElement.setAttribute('lang', lang);
    } catch {
      // ignore
    }
  }, []);

  const t = useMemo(() => getTranslation(language), [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      setLanguage: () => {},
      t: getTranslation('en'),
    };
  }
  return context;
};
