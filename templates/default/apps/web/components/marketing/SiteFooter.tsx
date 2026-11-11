import { footerLinks } from '@/lib/marketing/siteLinks'
import { brand } from '@starter/common'
import { AppLogo } from '@starter/ui'
import { useTranslations } from 'next-intl'
import React from 'react'

import { SiteLink } from './SiteLink'

/**
 * Site footer: the legal and support links the App Store listing points to.
 */
export const SiteFooter = () => {
  const t = useTranslations('footer')

  return (
    <footer className="border-border bg-muted/60 border-t">
      <div className="max-w-content px-gutter mx-auto flex w-full flex-wrap justify-between gap-8 py-10 md:px-8">
        <div className="flex max-w-lg flex-col gap-2.5">
          <span className="flex items-center gap-2">
            <AppLogo size={24} />
            <span className="font-display rtl:font-display-ar text-foreground text-lg">
              {brand.displayName}
            </span>
          </span>
          <p className="text-foreground-soft text-sm leading-relaxed">
            {t('tagline', { app: brand.displayName })}
          </p>
          <p className="text-foreground-soft text-sm">
            {t('copyright', {
              year: new Date().getFullYear(),
              app: brand.displayName,
            })}
          </p>
        </div>

        <nav aria-label={t('label')}>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {footerLinks.map(({ key, href }) => (
              <li key={href}>
                <SiteLink
                  href={href}
                  className="text-foreground hover:text-primary underline-offset-2 hover:underline">
                  {t(key)}
                </SiteLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
