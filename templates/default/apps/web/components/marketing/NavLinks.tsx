'use client'

import { usePathname } from '@/i18n/routing'
import type { SiteNavLink } from '@/lib/marketing/siteLinks'
import { classMerge } from '@starter/ui/lib/utils'
import React from 'react'

import { SiteLink } from './SiteLink'

interface NavLinksProps {
  links: SiteNavLink[]
  label: string
}

/**
 * The navbar's links, marking the current page. Labels arrive already
 * translated from `SiteNavbar`, so this module pulls in neither translations
 * nor the `@starter/ui` barrel.
 */
export const NavLinks = ({ links, label }: NavLinksProps) => {
  // `usePathname` from the i18n routing has the locale prefix stripped already.
  const pathname = usePathname()

  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px]">
        {links.map((link) => {
          const current = pathname === link.href

          return (
            <li key={link.href}>
              <SiteLink
                href={link.href}
                aria-current={current ? 'page' : undefined}
                className={classMerge(
                  'hover:text-primary transition-colors',
                  current ? 'text-primary font-semibold' : 'text-foreground',
                )}>
                {link.label}
              </SiteLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
