import { Link } from '@/i18n/routing'
import { navLinks } from '@/lib/marketing/siteLinks'
import { brand } from '@starter/common'
import { AppLogo } from '@starter/ui'
import { useTranslations } from 'next-intl'
import React from 'react'

import { LocaleSwitcher } from './LocaleSwitcher'
import { MobileNavDrawer } from './MobileNavDrawer'
import { NavLinks } from './NavLinks'
import { StickyHeader } from './StickyHeader'

/**
 * The navbar every page shares. A server component: the logo and labels
 * render here, and only the links that mark the current page ship as client
 * code. On a phone the bar keeps the logo and the language switch; the links
 * move into a drawer behind a menu button.
 */
export const SiteNavbar = () => {
  const t = useTranslations('nav')
  const links = navLinks.map(({ key, href }) => ({ label: t(key), href }))

  return (
    <StickyHeader>
      <div className="max-w-content px-gutter mx-auto flex w-full items-center justify-between gap-4 py-3 md:gap-6 md:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 outline-none">
          <AppLogo size={30} />
          <span className="font-display rtl:font-display-ar text-foreground truncate text-xl">
            {brand.displayName}
          </span>
        </Link>

        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden md:block">
            <NavLinks links={links} label={t('label')} />
          </div>
          <LocaleSwitcher />
          <MobileNavDrawer
            links={links}
            label={t('label')}
            openLabel={t('openMenu')}
            closeLabel={t('closeMenu')}
          />
        </div>
      </div>
    </StickyHeader>
  )
}
