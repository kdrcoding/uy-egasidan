import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { dictionaries, uz } from '@/constants/translations';
import type { Language } from '@/types/language';
import type { Currency } from '@/types/property';
import { readJson, STORAGE_KEYS, writeJson } from '@/utils/storage';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  /**
   * Translates a key for the active language, falling back to Uzbek and then
   * to the raw key. Accepts dynamic keys (e.g. `type.apartment`).
   */
  t: (key: string) => string;
  /** Preferred currency for new listings and search defaults (UZS by default). */
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('uz');
  const [currency, setCurrencyState] = useState<Currency>('UZS');

  // Restore persisted preferences on startup.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [storedLanguage, storedCurrency] = await Promise.all([
        readJson<Language>(STORAGE_KEYS.language),
        readJson<Currency>(STORAGE_KEYS.currency),
      ]);
      if (cancelled) {
        return;
      }
      if (storedLanguage === 'uz' || storedLanguage === 'ru' || storedLanguage === 'en') {
        setLanguageState(storedLanguage);
      }
      if (storedCurrency === 'UZS' || storedCurrency === 'USD') {
        setCurrencyState(storedCurrency);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    void writeJson(STORAGE_KEYS.language, next);
  }, []);

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next);
    void writeJson(STORAGE_KEYS.currency, next);
  }, []);

  const t = useCallback(
    (key: string): string => {
      const active = dictionaries[language] as Record<string, string | undefined>;
      const fallback = uz as Record<string, string | undefined>;
      return active[key] ?? fallback[key] ?? key;
    },
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t, currency, setCurrency }),
    [language, setLanguage, t, currency, setCurrency],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
