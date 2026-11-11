import { isLocale } from '@/lib/utils/locale.enum'
import { getRequestConfig } from 'next-intl/server'

import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  const locale = await requestLocale

  const validLocale = isLocale(locale) ? locale : routing.defaultLocale

  return {
    locale: validLocale,
    messages: (await import(`../locales/${validLocale}.json`)).default,
  }
})
