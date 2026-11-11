import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import type { EnMessages } from '../i18n';

// ---------------------------------------------------------------------------
// Type utilities — derive all dot-notation keys from the nested JSON structure
// ---------------------------------------------------------------------------

type LeafPaths<T, Prefix extends string = ''> = T extends string
  ? Prefix
  : {
      [K in keyof T & string]: LeafPaths<T[K], Prefix extends '' ? K : `${Prefix}.${K}`>;
    }[keyof T & string];

/** All valid dot-notation translation keys — full autocomplete in your IDE */
export type TranslationKey = LeafPaths<EnMessages>;

/**
 * Given a single dot-notation string, recursively produces every non-leaf prefix.
 *
 * @example
 * AllPrefixes<'auth.forgotPassword.form.email.label'>
 *   → 'auth' | 'auth.forgotPassword' | 'auth.forgotPassword.form' | 'auth.forgotPassword.form.email'
 */
type AllPrefixes<K extends string> = K extends `${infer Head}.${infer Tail}`
  ? Head | `${Head}.${AllPrefixes<Tail>}`
  : never;

/**
 * All valid namespace prefixes — every intermediate node at every depth.
 * e.g. "auth", "auth.forgotPassword", "auth.forgotPassword.form", …
 *
 * These are the values accepted by the scoped overload of useTranslation().
 */
export type TranslationNamespace = AllPrefixes<TranslationKey>;

/**
 * All leaf keys that live directly under a given namespace prefix `P`.
 *
 * @example
 * ScopedKey<'auth.forgotPassword.form'>
 *   → 'email.label' | 'email.placeholder' | 'submit'
 */
export type ScopedKey<P extends string> =
  Extract<TranslationKey, `${P}.${string}`> extends `${P}.${infer Rest}` ? Rest : never;

type Values = Record<string, string | number | boolean>;

// ---------------------------------------------------------------------------
// useTranslation hook — two overloads
// ---------------------------------------------------------------------------

/**
 * Unscoped: t() accepts any TranslationKey.
 *
 * @example
 * const { t } = useTranslation();
 * t('profile.menu.preferences')             // ✅ full autocomplete
 * t('common.duration.hours', { count: 3 })  // ✅ with values
 * t('profile.menu.TYPO')                    // ❌ TypeScript error
 */
export function useTranslation(): {
  t: (key: TranslationKey, values?: Values) => string;
  intl: ReturnType<typeof useIntl>;
};

/**
 * Scoped: pass a namespace prefix and t() only accepts the leaf keys beneath it.
 *
 * @example
 * const { t } = useTranslation('auth.forgotPassword.form');
 * t('email.label')        // ✅  → 'auth.forgotPassword.form.email.label'
 * t('submit')             // ✅  → 'auth.forgotPassword.form.submit'
 * t('email.TYPO')         // ❌ TypeScript error
 */
export function useTranslation<P extends TranslationNamespace>(
  prefix: P
): {
  t: (key: ScopedKey<P>, values?: Values) => string;
  intl: ReturnType<typeof useIntl>;
};

// Implementation — intentionally wide so both overloads are compatible
export function useTranslation(prefix?: string): {
  t: (key: string, values?: Values) => string;
  intl: ReturnType<typeof useIntl>;
} {
  const intl = useIntl();

  // Memoized so `t` keeps a stable identity across renders — an unstable `t` in a
  // useEffect/useMemo dependency array re-fires the effect on every render.
  const t = useCallback(
    (key: string, values?: Values) =>
      intl.formatMessage({ id: prefix !== undefined ? `${prefix}.${key}` : key }, values),
    [intl, prefix]
  );

  return useMemo(() => ({ t, intl }), [t, intl]);
}

/** Type of the unscoped t() function — useful for passing t as a prop */
export type TranslationFunction<P extends TranslationNamespace> = (
  key: ScopedKey<P>,
  values?: Values
) => string;
