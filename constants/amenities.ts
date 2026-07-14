import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

import type { Property } from '@/types/property';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Boolean amenity fields on `Property`, paired with an icon and a translation
 * key. Reused by the add-property form (as toggles) and the details screen
 * (as an amenity grid) so the set stays in sync in one place.
 */
export type AmenityKey =
  | 'furnished'
  | 'parking'
  | 'balcony'
  | 'airConditioning'
  | 'internet'
  | 'petsAllowed'
  | 'utilitiesIncluded';

export interface AmenityDescriptor {
  key: AmenityKey;
  icon: IoniconName;
  /** Translation key resolved via the language context. */
  labelKey: string;
}

export const AMENITIES: AmenityDescriptor[] = [
  { key: 'furnished', icon: 'bed-outline', labelKey: 'amenity.furnished' },
  { key: 'parking', icon: 'car-outline', labelKey: 'amenity.parking' },
  { key: 'balcony', icon: 'browsers-outline', labelKey: 'amenity.balcony' },
  { key: 'airConditioning', icon: 'snow-outline', labelKey: 'amenity.airConditioning' },
  { key: 'internet', icon: 'wifi-outline', labelKey: 'amenity.internet' },
  { key: 'petsAllowed', icon: 'paw-outline', labelKey: 'amenity.petsAllowed' },
  { key: 'utilitiesIncluded', icon: 'flash-outline', labelKey: 'amenity.utilitiesIncluded' },
];

/** Returns the amenities that are enabled for a given property. */
export function activeAmenities(property: Property): AmenityDescriptor[] {
  return AMENITIES.filter((amenity) => property[amenity.key]);
}
