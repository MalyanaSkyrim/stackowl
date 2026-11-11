import ar from './messages/ar.json';
import en from './messages/en.json';
import fr from './messages/fr.json';

// Recursively flatten nested message objects into dot-notation keys
// e.g. { profile: { menu: { preferences: "Preferences" } } }
//   → { "profile.menu.preferences": "Preferences" }
// react-intl only accepts flat key-value pairs.
export function flattenMessages(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  return Object.entries(obj).reduce<Record<string, string>>((acc, [key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(acc, flattenMessages(value as Record<string, unknown>, fullKey));
    } else {
      acc[fullKey] = String(value);
    }
    return acc;
  }, {});
}

export const messages = {
  en: flattenMessages(en as Record<string, unknown>),
  fr: flattenMessages(fr as Record<string, unknown>),
  ar: flattenMessages(ar as Record<string, unknown>),
} as const;

/**
 * Arabic with Western digits (123). The same messages as Arabic today; add an override file
 * here if some messages should read differently (durations written in Latin letters, say).
 */
export const arabicWesternMessages = messages.ar;

export type Locale = keyof typeof messages;

// Export the raw nested en object for type inference — used by useTranslation
export type EnMessages = typeof en;
