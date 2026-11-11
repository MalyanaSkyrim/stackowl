import { intlLocale, isLocale } from '@/lib/utils/locale.enum'

import { LEGAL_LAST_UPDATED } from './legal'

/** The legal pages' "last updated" date, in the page's language. */
export const formatLegalDate = (locale: string) =>
  new Intl.DateTimeFormat(isLocale(locale) ? intlLocale[locale] : undefined, {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${LEGAL_LAST_UPDATED}T00:00:00Z`))
