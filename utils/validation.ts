import type { Currency, ListingType, PropertyType } from '@/types/property';

/**
 * Reusable validation primitives and the add-property draft validator.
 * Screens keep no validation logic inline — they call these helpers so the
 * rules stay in one place and are easy to test.
 */

/** Form draft. Numeric inputs are kept as strings and parsed here. */
export interface ListingDraft {
  listingType: ListingType;
  propertyType: PropertyType | null;
  city: string;
  district: string;
  neighborhood: string;
  street: string;
  nearbyLandmark: string;
  rooms: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  floor: string;
  totalFloors: string;
  furnished: boolean;
  parking: boolean;
  balcony: boolean;
  airConditioning: boolean;
  internet: boolean;
  petsAllowed: boolean;
  /** Monthly rent for rentals, total price for sales. */
  price: string;
  currency: Currency;
  deposit: string;
  utilitiesIncluded: boolean;
  availableFrom: string;
  maxOccupants: string;
  contactPhone: string;
  telegramUsername: string;
  title: string;
  description: string;
  images: string[];
}

export type DraftField = keyof ListingDraft;

export interface ValidationResult {
  valid: boolean;
  fieldErrors: Partial<Record<DraftField, string>>;
  messages: string[];
}

export function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/** Parses a positive integer-ish number from a string input. */
export function parsePositiveNumber(value: string): number | null {
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  if (normalized.length === 0) {
    return null;
  }
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

/** Parses a non-negative number (deposit may legitimately be 0). */
export function parseNonNegativeNumber(value: string): number | null {
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  if (normalized.length === 0) {
    return null;
  }
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

/** Very light YYYY-MM-DD shape check (no backend / real calendar in MVP). */
export function isValidDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

/** Uzbekistan phone number: +998 followed by 9 digits (spaces/dashes allowed). */
export function isValidUzPhone(value: string): boolean {
  return /^\+998\d{9}$/.test(value.replace(/[\s-]/g, ''));
}

/**
 * Validates one wizard step so the user gets feedback before moving on.
 * Step numbers mirror the add-property screen (1-based).
 */
export function validateListingStep(draft: ListingDraft, step: number): ValidationResult {
  const fieldErrors: Partial<Record<DraftField, string>> = {};

  if (step === 1) {
    if (!draft.propertyType) {
      fieldErrors.propertyType = 'Uy turini tanlang.';
    }
  }
  if (step === 2) {
    if (!isNonEmpty(draft.district)) {
      fieldErrors.district = 'Tumanni tanlang.';
    }
  }
  if (step === 3) {
    if (parsePositiveNumber(draft.rooms) === null) {
      fieldErrors.rooms = 'Xonalar sonini kiriting.';
    }
    if (parsePositiveNumber(draft.area) === null) {
      fieldErrors.area = 'Maydonni kiriting.';
    }
  }
  if (step === 4) {
    if (parsePositiveNumber(draft.price) === null) {
      fieldErrors.price =
        draft.listingType === 'sale' ? 'Sotish narxini kiriting.' : 'Oylik ijara narxini kiriting.';
    }
    if (draft.listingType === 'rent') {
      if (parseNonNegativeNumber(draft.deposit) === null) {
        fieldErrors.deposit = "Zaklad summasini kiriting (0 bo'lishi mumkin).";
      }
      if (!isValidDateString(draft.availableFrom)) {
        fieldErrors.availableFrom = "Bo'sh sanani YYYY-MM-DD ko'rinishida kiriting.";
      }
    }
    if (!isValidUzPhone(draft.contactPhone)) {
      fieldErrors.contactPhone = 'Aloqa telefonini +998 bilan kiriting.';
    }
  }
  if (step === 5) {
    if (!isNonEmpty(draft.title)) {
      fieldErrors.title = "E'lon sarlavhasini kiriting.";
    } else if (draft.title.trim().length < 6) {
      fieldErrors.title = 'Sarlavha juda qisqa (kamida 6 ta belgi).';
    }
    if (!isNonEmpty(draft.description)) {
      fieldErrors.description = 'Qisqacha tavsif yozing.';
    }
    if (draft.images.length === 0) {
      fieldErrors.images = 'Kamida 1 ta rasm qo‘shing.';
    }
  }

  const messages = Object.values(fieldErrors);
  return { valid: messages.length === 0, fieldErrors, messages };
}

/** Validates the full listing draft before publishing. */
export function validateListingDraft(draft: ListingDraft): ValidationResult {
  const fieldErrors: Partial<Record<DraftField, string>> = {};
  const messages: string[] = [];

  for (const step of [1, 2, 3, 4, 5]) {
    const result = validateListingStep(draft, step);
    Object.assign(fieldErrors, result.fieldErrors);
    messages.push(...result.messages);
  }

  return { valid: messages.length === 0, fieldErrors, messages };
}
