/**
 * Centralized color palette for Uy Egasidan.
 *
 * The identity is built around a single trustworthy green accent (evoking
 * "keys handed directly from the owner") on a light, high-contrast neutral
 * surface. Trust signals use green; informational accents use blue. No screen
 * or component should hard-code hex values — always import from here.
 */

export const colors = {
  // Brand accent
  primary: '#0E7C66',
  primaryDark: '#0A5E4D',
  primaryLight: '#E4F3EF',

  // Trust / verification (green family)
  trust: '#137B4B',
  trustLight: '#E5F4EC',

  // Informational accent (blue family)
  info: '#1F6FEB',
  infoLight: '#E7F0FE',

  // Warning / safety
  warning: '#B4690E',
  warningLight: '#FCF1E1',
  danger: '#C2321B',
  dangerLight: '#FBEBE8',

  // Neutrals
  background: '#F6F7F9',
  surface: '#FFFFFF',
  surfaceMuted: '#F0F2F5',

  border: '#E3E6EB',
  borderStrong: '#CDD2DA',

  textPrimary: '#12161C',
  textSecondary: '#4A5460',
  textMuted: '#828B98',
  textInverse: '#FFFFFF',

  overlay: 'rgba(18, 22, 28, 0.45)',
  transparent: 'transparent',
} as const;

export type ColorName = keyof typeof colors;
