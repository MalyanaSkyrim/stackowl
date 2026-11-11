/** Add a locale here and a `locales/<locale>.json` with every key. For a right-to-left
 * language such as Arabic, also return 'rtl' from `localeDirection`. */
export const locales = ['en', 'fr'] as const

export type Locale = (typeof locales)[number]

/**
 * Widened copy so `includes` accepts an arbitrary string without an assertion.
 */
const localeList: readonly string[] = locales

/**
 * Deliberately zod-free: this module is pulled in by the i18n routing that
 * every client component imports, and a schema here would ship zod to the
 * browser on a marketing page that has no forms.
 */
export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && localeList.includes(value)

/** The page's `dir` comes from here. Both starter locales read left to right. */
export const localeDirection = (_locale: Locale): 'ltr' | 'rtl' => 'ltr'

/** The label each language goes by in the switcher, in its own script. */
export const localeLabels: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
}

/** The BCP 47 tag `Intl` formats numbers and dates with. */
export const intlLocale: Record<Locale, string> = {
  en: 'en-US',
  fr: 'fr-FR',
}
