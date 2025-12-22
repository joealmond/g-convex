'use client';

import { useState, useEffect, useCallback } from 'react';
import enTranslations from '@/locales/en.json';
import huTranslations from '@/locales/hu.json';

const LOCALE_KEY = 'g-convex-locale';

type Translations = typeof enTranslations;
type Locale = 'en' | 'hu';

const translations: Record<Locale, Translations> = {
  en: enTranslations,
  hu: huTranslations,
};

/**
 * Get the stored locale or default to 'en'
 */
function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(LOCALE_KEY);
  return (stored === 'hu' || stored === 'en') ? stored : 'en';
}

/**
 * Set the locale in localStorage
 */
export function setLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCALE_KEY, locale);
    // Trigger a custom event so components can react
    window.dispatchEvent(new CustomEvent('locale-change', { detail: locale }));
  }
}

/**
 * Hook to get the current locale
 */
export function useLocale(): Locale {
  const [locale, setLocaleState] = useState<Locale>('en');
  
  useEffect(() => {
    setLocaleState(getStoredLocale());
    
    const handleChange = (e: CustomEvent<Locale>) => {
      setLocaleState(e.detail);
    };
    
    window.addEventListener('locale-change', handleChange as EventListener);
    return () => window.removeEventListener('locale-change', handleChange as EventListener);
  }, []);
  
  return locale;
}

/**
 * Hook to get translations for a specific namespace
 */
export function useTranslations(namespace?: string) {
  const locale = useLocale();
  
  return useCallback((key: string, params?: Record<string, any>): string => {
    const dict = translations[locale];
    
    // Get the namespace object or root
    const nsObj = namespace ? (dict as any)[namespace] : dict;
    if (!nsObj) return key;
    
    // Get the translation
    let translation = nsObj[key] as string | undefined;
    if (!translation) return key;
    
    // Replace parameters like {productName}
    if (params) {
      Object.entries(params).forEach(([pKey, pVal]) => {
        translation = translation!.replace(`{${pKey}}`, String(pVal));
      });
    }
    
    return translation;
  }, [locale, namespace]);
}

/**
 * Get available locales
 */
export function getLocales(): Locale[] {
  return ['en', 'hu'];
}

