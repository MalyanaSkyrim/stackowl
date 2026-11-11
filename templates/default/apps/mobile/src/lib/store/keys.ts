/**
 * Every key saved in the phone's key-value store. Add a key here before creating its atom,
 * so this file stays the list of what the app persists.
 */
export const STORAGE_KEYS = {
  language: 'settings.language',
  arabicNumerals: 'settings.arabic-numerals',
  theme: 'settings.theme',
  pendingAppleName: 'auth.pending-apple-name',
} as const;

/** Keys saved in the iOS Keychain (expo-secure-store) instead, for secrets. */
export const SECURE_STORAGE_KEYS = {
  session: 'auth.session',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export type SecureStorageKey = (typeof SECURE_STORAGE_KEYS)[keyof typeof SECURE_STORAGE_KEYS];
