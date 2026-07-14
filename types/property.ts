/**
 * Core domain types for the Uy Egasidan marketplace.
 *
 * Only property owners publish listings — there are no agencies or brokers
 * in this data model, which is why every listing carries owner verification
 * fields directly instead of an agency reference. Listings can be offered
 * for rent (monthly price) or for sale (total price).
 */

export type PropertyType = 'apartment' | 'house' | 'private_room' | 'shared_room';

export type ListingType = 'rent' | 'sale';

export type Currency = 'UZS' | 'USD';

export type PropertyStatus =
  | 'draft'
  | 'pending'
  | 'published'
  | 'rented'
  | 'sold'
  | 'rejected'
  | 'expired';

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  city: string;
  district: string;
  neighborhood?: string;
  street?: string;
  nearbyLandmark?: string;
  /** Monthly price for rentals, total price for sales. */
  price: number;
  currency: Currency;
  /** Rental deposit; always 0 for sale listings. */
  deposit: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  areaSquareMeters: number;
  floor?: number;
  totalFloors?: number;
  furnished: boolean;
  petsAllowed: boolean;
  utilitiesIncluded: boolean;
  parking: boolean;
  balcony: boolean;
  airConditioning: boolean;
  internet: boolean;
  maximumOccupants?: number;
  /** Rentals only; empty for sale listings. */
  availableFrom: string;
  ownerVerified: boolean;
  propertyVerified: boolean;
  confirmedAvailableAt: string;
  status: PropertyStatus;
  images: string[];
  createdAt: string;
  /** Owner contact shown on the detail screen. */
  contactPhone?: string;
  /** Telegram username without the @ (deep-linked as t.me/username). */
  telegramUsername?: string;
}
