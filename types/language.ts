/**
 * Localization types. The app ships with Uzbek Latin (default), Russian and
 * English. Translations may be partial for RU/EN during the MVP — the
 * translation lookup falls back to Uzbek and then to the raw key.
 */

export type Language = 'uz' | 'ru' | 'en';

export interface LanguageOption {
  code: Language;
  /** Name shown in the current UI language. */
  label: string;
  /** Name shown in the language's own script, for the selector. */
  nativeLabel: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'uz', label: "O'zbekcha", nativeLabel: "O'zbekcha (Lotin)" },
  { code: 'ru', label: 'Русский', nativeLabel: 'Русский' },
  { code: 'en', label: 'English', nativeLabel: 'English' },
];
