import type { PropertyFilters, SortOption } from '@/types/filters';
import type { Property } from '@/types/property';

/**
 * Pure, reusable search/filter/sort logic. Both the Home and Search screens
 * rely on these functions so filtering behaves identically everywhere and can
 * be memoized by callers.
 */

/** Only published listings are ever shown to browsers. */
export function getPublishedProperties(properties: Property[]): Property[] {
  return properties.filter((p) => p.status === 'published');
}

function matchesQuery(property: Property, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return true;
  }
  const haystack = [
    property.title,
    property.description,
    property.district,
    property.city,
    property.neighborhood ?? '',
    property.nearbyLandmark ?? '',
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
}

export function sortProperties(properties: Property[], sort: SortOption): Property[] {
  const copy = [...properties];
  switch (sort) {
    case 'price_asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'area_desc':
      return copy.sort((a, b) => b.areaSquareMeters - a.areaSquareMeters);
    case 'newest':
    default:
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}

/**
 * Applies the full filter set to the published listings and returns a sorted
 * result. Currency filtering compares the listing currency directly (prices
 * are not converted in the MVP).
 */
export function filterProperties(
  properties: Property[],
  filters: PropertyFilters,
): Property[] {
  const published = getPublishedProperties(properties);

  const filtered = published.filter((property) => {
    if (!matchesQuery(property, filters.query ?? '')) {
      return false;
    }
    if (filters.listingType && property.listingType !== filters.listingType) {
      return false;
    }
    if (filters.city && property.city !== filters.city) {
      return false;
    }
    if (filters.district && property.district !== filters.district) {
      return false;
    }
    if (filters.propertyType && property.propertyType !== filters.propertyType) {
      return false;
    }
    if (filters.currency && property.currency !== filters.currency) {
      return false;
    }
    if (typeof filters.minPrice === 'number' && property.price < filters.minPrice) {
      return false;
    }
    if (typeof filters.maxPrice === 'number' && property.price > filters.maxPrice) {
      return false;
    }
    if (typeof filters.rooms === 'number') {
      // "4" means 4 or more rooms.
      if (filters.rooms >= 4 ? property.rooms < 4 : property.rooms !== filters.rooms) {
        return false;
      }
    }
    if (filters.furnished && !property.furnished) {
      return false;
    }
    if (filters.petsAllowed && !property.petsAllowed) {
      return false;
    }
    return true;
  });

  return sortProperties(filtered, filters.sort);
}

/** Counts how many non-default filters are active (sort excluded). */
export function countActiveFilters(filters: PropertyFilters): number {
  let count = 0;
  if (filters.query && filters.query.trim().length > 0) count += 1;
  if (filters.listingType) count += 1;
  if (filters.city) count += 1;
  if (filters.district) count += 1;
  if (filters.propertyType) count += 1;
  if (filters.currency) count += 1;
  if (typeof filters.minPrice === 'number') count += 1;
  if (typeof filters.maxPrice === 'number') count += 1;
  if (typeof filters.rooms === 'number') count += 1;
  if (filters.furnished) count += 1;
  if (filters.petsAllowed) count += 1;
  return count;
}
