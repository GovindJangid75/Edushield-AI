'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from './translations';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en'], params?: Record<string, string>) => string;
  isOnline: boolean;
  isConnecting: boolean;
  triggerSyncNotification: () => void;
  showSyncToast: boolean;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [showSyncToast, setShowSyncToast] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  // Initialize values safely on the client side only to prevent Next.js hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // 1. Language Persistence
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang === 'en' || savedLang === 'hi') {
      setLanguageState(savedLang);
    } else {
      // Fallback to browser locale if Hindi is preferred
      const locale = navigator.language.toLowerCase();
      if (locale.includes('hi') || locale.includes('in')) {
        setLanguageState('hi');
      }
    }

    // 2. Connectivity Detector
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsConnecting(true);
      // Simulate low-connectivity connection handshake before declaring full success
      setTimeout(() => {
        setIsOnline(true);
        setIsConnecting(false);
        
        // Show synchronization success toast when reconnected
        setShowSyncToast(true);
        setTimeout(() => setShowSyncToast(false), 4000);
        
        // Trigger a custom event to notify components to sync data
        window.dispatchEvent(new Event('online-sync'));
      }, 1500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsConnecting(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    // Set html lang attribute for accessibility and SEO
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  const triggerSyncNotification = () => {
    setShowSyncToast(true);
    setTimeout(() => setShowSyncToast(false), 4000);
  };

  // Translation Function supporting dynamic parameters
  const t = (key: keyof typeof translations['en'], params?: Record<string, string>): string => {
    const dict = translations[language] || translations['en'];
    let text = dict[key] || translations['en'][key] || String(key);
    
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };

  // Render a skeleton wrapper during server rendering to prevent hydration mismatches
  if (!mounted) {
    return (
      <LanguageContext.Provider value={{
        language: 'en',
        setLanguage: () => {},
        t: (key) => translations['en'][key] || String(key),
        isOnline: true,
        isConnecting: false,
        triggerSyncNotification: () => {},
        showSyncToast: false,
      }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      isOnline,
      isConnecting,
      triggerSyncNotification,
      showSyncToast,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function useTranslation() {
  const { t, language } = useLanguage();
  return { t, language };
}
