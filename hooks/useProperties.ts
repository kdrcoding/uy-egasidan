import { useCallback, useMemo } from 'react';

import { useListings } from '@/context/ListingsContext';
import type { Property } from '@/types/property';
import { getPublishedProperties, sortProperties } from '@/utils/propertyFilters';

interface UsePropertiesResult {
  properties: Property[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  getById: (id: string) => Property | undefined;
  featured: Property[];
  latest: Property[];
}

/**
 * Published listings for browse screens, backed by the shared ListingsContext
 * (mock data + listings the user created on this device). The result shape is
 * kept stable so it can be swapped for a Supabase query later without
 * touching consumers.
 */
export function useProperties(): UsePropertiesResult {
  const { properties: allProperties, hydrating, getById: getAnyById } = useListings();

  const properties = useMemo(
    () => getPublishedProperties(allProperties),
    [allProperties],
  );

  // Detail screens must be able to resolve the user's own non-published
  // listing too (e.g. previewing a rented-out listing from "My listing").
  const getById = useCallback((id: string) => getAnyById(id), [getAnyById]);

  const featured = useMemo(
    () =>
      sortProperties(
        properties.filter((p) => p.ownerVerified && p.propertyVerified),
        'newest',
      ).slice(0, 6),
    [properties],
  );

  const latest = useMemo(() => sortProperties(properties, 'newest'), [properties]);

  return {
    properties,
    loading: hydrating,
    error: null,
    reload: () => {},
    getById,
    featured,
    latest,
  };
}
