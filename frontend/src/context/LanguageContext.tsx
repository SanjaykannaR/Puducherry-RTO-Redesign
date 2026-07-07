'use client';

// ── Imports ──

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Locale, getLocaleFromStorage, setLocaleToStorage } from '@/lib/i18n/translations';

// ── Types ──

interface LanguageContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

// ── Context ──
// Defaults to English so SSR renders something predictable; the actual stored value is read on the client.
const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLocale: () => {},
});

// ── Provider ──
// Persists the chosen locale (en/ta/fr) in localStorage so the preference survives across sessions.
// Wraps the entire app so that every component can call t(key, locale) with the active locale.
export function LanguageProvider({ children }: { children: ReactNode }) {
  // ── State ──
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);      // Guards against hydration mismatch

  // ── Restore Preference ──
  // Read saved locale from localStorage once on mount (client-only operation).
  useEffect(() => {
    setLocaleState(getLocaleFromStorage());
    setMounted(true);
  }, []);

  // ── Set Locale ──
  // Updates React state, persists to localStorage, and syncs the <html lang> attribute for accessibility.
  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    setLocaleToStorage(l);
    document.documentElement.lang = l;
  }, []);

  // ── Render ──
  // Before mount, render children without the provider to avoid hydration mismatches.
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ── Hook ──

export function useLanguage() {
  return useContext(LanguageContext);
}
