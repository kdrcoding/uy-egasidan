import type { Currency, ListingType, PropertyType } from '@/types/property';

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'area_desc';

/**
 * Filter state used by the Search screen. Every field is optional so the
 * default (empty) filter matches all published listings. Reusable filtering
 * logic in `utils/propertyFilters.ts` consumes this shape.
 */
export interface PropertyFilters {
  query?: string;
  listingType?: ListingType;
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  rooms?: number;
  propertyType?: PropertyType;
  furnished?: boolean;
  petsAllowed?: boolean;
  currency?: Currency;
  sort: SortOption;
}

export const EMPTY_FILTERS: PropertyFilters = {
  sort: 'newest',
};
