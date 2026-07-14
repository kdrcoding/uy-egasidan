import { useMemo } from 'react';

import { useFavoritesContext } from '@/context/FavoritesContext';
import type { Property } from '@/types/property';

/**
 * Convenience hook over the favorites context. Re-exports the toggle/remove
 * API and, given a list of properties, derives the favorited subset.
 */
export function useFavorites(allProperties: Property[] = []) {
  const context = useFavoritesContext();

  const favoriteProperties = useMemo(
    () => allProperties.filter((property) => context.isFavorite(property.id)),
    [allProperties, context],
  );

  return { ...context, favoriteProperties };
}
