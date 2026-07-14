import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { readJson, STORAGE_KEYS, writeJson } from '@/utils/storage';

/**
 * Favorites store persisted in AsyncStorage so saved listings survive app
 * restarts. A Set keyed by property id gives O(1) toggles and lookups.
 */
interface FavoritesContextValue {
  favoriteIds: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  count: number;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(() => new Set<string>());
  const hydrated = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await readJson<string[]>(STORAGE_KEYS.favorites);
      if (!cancelled && Array.isArray(stored)) {
        setIds(new Set(stored));
      }
      hydrated.current = true;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist after every change (skipping the initial empty state).
  useEffect(() => {
    if (hydrated.current) {
      void writeJson(STORAGE_KEYS.favorites, Array.from(ids));
    }
  }, [ids]);

  const toggleFavorite = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setIds((prev) => {
      if (!prev.has(id)) {
        return prev;
      }
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => ids.has(id), [ids]);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteIds: Array.from(ids),
      isFavorite,
      toggleFavorite,
      removeFavorite,
      count: ids.size,
    }),
    [ids, isFavorite, toggleFavorite, removeFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavoritesContext(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  return context;
}
