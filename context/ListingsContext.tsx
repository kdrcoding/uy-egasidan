import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { MOCK_PROPERTIES } from '@/data/mockProperties';
import type { Property, PropertyStatus } from '@/types/property';
import { readJson, STORAGE_KEYS, writeJson } from '@/utils/storage';

/**
 * Single source of truth for listings: demo (mock) listings plus listings the
 * signed-in user created on this device, persisted in AsyncStorage.
 *
 * Marketplace rule: ONE listing per user. A user may only create a new
 * listing when they have no existing listing at all — finished ("rented" /
 * "sold") listings still occupy the slot until deleted, which keeps the
 * marketplace free of dead inventory.
 */
interface ListingsContextValue {
  /** Every listing (any status). Screens filter for `published` themselves. */
  properties: Property[];
  /** True until persisted user listings have been loaded. */
  hydrating: boolean;
  getById: (id: string) => Property | undefined;
  /** The listing owned by the given user, if any (one per user). */
  getOwnListing: (ownerId: string) => Property | undefined;
  /** Adds a listing. Fails when the user already has one (one-per-user rule). */
  addListing: (listing: Property) => { ok: true } | { ok: false; reason: 'limit' };
  setListingStatus: (id: string, status: PropertyStatus) => void;
  deleteListing: (id: string) => void;
}

const ListingsContext = createContext<ListingsContextValue | undefined>(undefined);

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [userListings, setUserListings] = useState<Property[]>([]);
  const [hydrating, setHydrating] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await readJson<Property[]>(STORAGE_KEYS.userListings);
      if (!cancelled) {
        if (Array.isArray(stored)) {
          setUserListings(stored);
        }
        setHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: Property[]) => {
    setUserListings(next);
    void writeJson(STORAGE_KEYS.userListings, next);
  }, []);

  const properties = useMemo(
    () => [...userListings, ...MOCK_PROPERTIES],
    [userListings],
  );

  const getById = useCallback(
    (id: string) => properties.find((property) => property.id === id),
    [properties],
  );

  const getOwnListing = useCallback(
    (ownerId: string) => userListings.find((listing) => listing.ownerId === ownerId),
    [userListings],
  );

  const addListing = useCallback(
    (listing: Property): { ok: true } | { ok: false; reason: 'limit' } => {
      const existing = userListings.find((item) => item.ownerId === listing.ownerId);
      if (existing) {
        return { ok: false, reason: 'limit' };
      }
      persist([listing, ...userListings]);
      return { ok: true };
    },
    [userListings, persist],
  );

  const setListingStatus = useCallback(
    (id: string, status: PropertyStatus) => {
      persist(
        userListings.map((listing) =>
          listing.id === id ? { ...listing, status } : listing,
        ),
      );
    },
    [userListings, persist],
  );

  const deleteListing = useCallback(
    (id: string) => {
      persist(userListings.filter((listing) => listing.id !== id));
    },
    [userListings, persist],
  );

  const value = useMemo<ListingsContextValue>(
    () => ({
      properties,
      hydrating,
      getById,
      getOwnListing,
      addListing,
      setListingStatus,
      deleteListing,
    }),
    [properties, hydrating, getById, getOwnListing, addListing, setListingStatus, deleteListing],
  );

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>;
}

export function useListings(): ListingsContextValue {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error('useListings must be used within a ListingsProvider');
  }
  return context;
}
