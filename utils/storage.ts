import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Thin JSON wrapper over AsyncStorage. All persistence goes through these
 * helpers so storage keys stay in one place and read/write failures degrade
 * gracefully (the app keeps working with in-memory state).
 */

export const STORAGE_KEYS = {
  language: 'uy.language',
  currency: 'uy.currency',
  favorites: 'uy.favorites',
  account: 'uy.account',
  userListings: 'uy.userListings',
} as const;

export async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is best-effort in the MVP.
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Persistence is best-effort in the MVP.
  }
}
