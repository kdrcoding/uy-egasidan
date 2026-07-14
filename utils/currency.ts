import type { Currency, ListingType } from '@/types/property';

/**
 * Currency formatting helpers.
 *
 * UZS is displayed with space-grouped thousands and a trailing code
 * (`5 500 000 UZS`); USD uses a leading `$` (`$450`). Rental prices get a
 * localized "/ oy" (per month) suffix; sale prices are shown as-is.
 */

/** Groups an integer with non-breaking-friendly thin spaces every 3 digits. */
function groupThousands(value: number): string {
  const rounded = Math.round(Math.abs(value));
  return rounded.toLocaleString('en-US').replace(/,/g, ' ');
}

export function formatCurrency(amount: number, currency: Currency): string {
  const grouped = groupThousands(amount);
  const sign = amount < 0 ? '-' : '';
  if (currency === 'USD') {
    return `${sign}$${grouped}`;
  }
  return `${sign}${grouped} UZS`;
}

/**
 * Formats a listing price: rentals get the per-month suffix
 * (`5 500 000 UZS / oy`), sales are the plain amount (`$45 000`).
 * The per-month label is passed in so it can be localized by the caller.
 */
export function formatPrice(
  amount: number,
  currency: Currency,
  listingType: ListingType,
  perMonthLabel: string,
): string {
  const base = formatCurrency(amount, currency);
  return listingType === 'rent' ? `${base} / ${perMonthLabel}` : base;
}

/** Price per square meter for sale listings, e.g. `$1 250 / m²`. */
export function formatPricePerSquareMeter(
  price: number,
  areaSquareMeters: number,
  currency: Currency,
): string | null {
  if (areaSquareMeters <= 0) {
    return null;
  }
  return `${formatCurrency(price / areaSquareMeters, currency)} / m²`;
}

/** Formats an area value in square meters. */
export function formatArea(squareMeters: number): string {
  return `${groupThousands(squareMeters)} m²`;
}
