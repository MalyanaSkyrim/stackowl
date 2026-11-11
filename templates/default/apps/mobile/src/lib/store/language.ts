import { atom } from 'jotai';
import { z } from 'zod';

import type { Locale } from '../i18n';
import { atomWithDeviceStorage } from './deviceStorage';
import { STORAGE_KEYS } from './keys';

/** The app languages, in the order they are offered. */
export const localeSchema = z.enum(['en', 'fr', 'ar']) satisfies z.ZodType<Locale>;

/** The languages written right to left: picking one, or leaving it, flips the layout. */
export const RTL_LOCALES: readonly Locale[] = ['ar'];

/** The app language the user picked. Defaults to English. */
export const languageAtom = atomWithDeviceStorage(STORAGE_KEYS.language, localeSchema, 'en');

/**
 * How numbers are written in Arabic: Western digits (123), as in the Maghreb, or Arabic-Indic
 * digits (١٢٣). The values are Unicode numbering systems.
 */
export const arabicNumeralsSchema = z.enum(['latn', 'arab']);
export type ArabicNumerals = z.infer<typeof arabicNumeralsSchema>;

/** The digits Arabic is shown with. Defaults to Arabic-Indic. */
export const arabicNumeralsAtom = atomWithDeviceStorage(
  STORAGE_KEYS.arabicNumerals,
  arabicNumeralsSchema,
  'arab'
);

/** Arabic with Western digits (123): always 24-hour, and durations end in Latin letters. */
export const arabicWesternAtom = atom(
  (get) => get(languageAtom) === 'ar' && get(arabicNumeralsAtom) === 'latn'
);

/** A few digits written each way, so the choice explains itself in the language lists. */
export const NUMERALS_SAMPLE: Record<ArabicNumerals, string> = { latn: '123', arab: '١٢٣' };

/** A row in the language lists: Arabic comes twice, once for each way of writing numbers. */
export type LanguageChoice = { locale: Locale; numerals: ArabicNumerals | null };

export const LANGUAGE_CHOICES: readonly LanguageChoice[] = localeSchema.options.flatMap(
  (locale): LanguageChoice[] =>
    locale === 'ar'
      ? arabicNumeralsSchema.options.map((numerals) => ({ locale, numerals }))
      : [{ locale, numerals: null }]
);

/** Whether a row in the language lists is the language (and digits) in use. */
export function isCurrentChoice(
  choice: LanguageChoice,
  locale: Locale,
  numerals: ArabicNumerals
): boolean {
  return choice.locale === locale && (choice.numerals === null || choice.numerals === numerals);
}

/**
 * The locale react-intl formats with. Arabic always names its digits (`ar-u-nu-latn` or
 * `ar-u-nu-arab`): what plain `ar` gives differs between versions of the locale data.
 */
export function intlLocale(locale: Locale, numerals: ArabicNumerals): string {
  return locale === 'ar' ? `ar-u-nu-${numerals}` : locale;
}
