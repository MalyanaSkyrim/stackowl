'use client'

import { Link, usePathname } from '@/i18n/routing'
import { localeLabels, locales } from '@/lib/utils/locale.enum'
import { classMerge } from '@starter/ui/lib/utils'
import { useLocale, useTranslations } from 'next-intl'
import React from 'react'

/**
 * Language switcher: EN · FR · عربي as one segmented control.
 *
 * Plain links rather than a dropdown: they need no JavaScript to work, search
 * engines can follow them to the other versions of the page, and each label
 * is written in its own language.
 */
export const LocaleSwitcher = ({ className }: { className?: string }) => {
  const t = useTranslations('common')
  const pathname = usePathname()
  const active = useLocale()

  return (
    <nav aria-label={t('languages')} className={className}>
      <ul className="border-input flex items-center gap-0.5 rounded-full border p-[3px]">
        {locales.map((locale) => (
          <li key={locale}>
            <Link
              href={pathname}
              locale={locale}
              lang={locale}
              aria-current={locale === active ? 'true' : undefined}
              className={classMerge(
                'inline-flex min-h-8 items-center rounded-full px-3 text-[13px] transition-colors',
                locale === active
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-foreground hover:bg-muted',
              )}>
              {localeLabels[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
