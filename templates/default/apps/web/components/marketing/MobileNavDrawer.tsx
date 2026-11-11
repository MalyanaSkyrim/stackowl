'use client'

import { usePathname } from '@/i18n/routing'
import type { SiteNavLink } from '@/lib/marketing/siteLinks'
import { classMerge } from '@starter/ui/lib/utils'
import { Menu, X } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { SiteLink } from './SiteLink'

interface MobileNavDrawerProps {
  links: SiteNavLink[]
  label: string
  openLabel: string
  closeLabel: string
}

/**
 * The phone navbar's menu: a button that slides the site's links in from the
 * end edge (the right in English and French, the left in Arabic). Escape, the
 * backdrop, the close button and any link close it, and focus goes back to
 * the button. Labels arrive translated from `SiteNavbar`, a server component.
 */
export const MobileNavDrawer = ({
  links,
  label,
  openLabel,
  closeLabel,
}: MobileNavDrawerProps) => {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const handleOpen = useCallback(() => setOpen(true), [])
  const handleClose = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return

    closeRef.current?.focus()
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, handleClose])

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        aria-label={openLabel}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        className="text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2">
        <Menu aria-hidden="true" className="h-6 w-6" />
      </button>

      {/* A fixed, clipping layer holds the closed drawer off screen; without
          it iOS Safari lets the page scroll sideways to the hidden panel. */}
      <div
        className={classMerge(
          'fixed inset-0 z-50 overflow-hidden',
          !open && 'pointer-events-none',
        )}>
        <div
          aria-hidden="true"
          onClick={handleClose}
          className={classMerge(
            'absolute inset-0 bg-black/40 transition-opacity duration-200 motion-reduce:transition-none',
            open ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        />

        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className={classMerge(
            'bg-background absolute inset-y-0 end-0 flex w-[min(20rem,85vw)] flex-col shadow-xl transition-transform duration-300 ease-out motion-reduce:transition-none',
            open
              ? 'visible translate-x-0'
              : 'invisible ltr:translate-x-full rtl:-translate-x-full',
          )}>
          <div className="flex justify-end p-3">
            <button
              ref={closeRef}
              type="button"
              onClick={handleClose}
              aria-label={closeLabel}
              className="text-foreground hover:bg-muted focus-visible:ring-ring inline-flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2">
              <X aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>

          <nav aria-label={label} className="px-gutter">
            <ul className="flex flex-col">
              {links.map((link) => {
                const current = pathname === link.href

                return (
                  <li key={link.href} className="border-border border-b">
                    <SiteLink
                      href={link.href}
                      onClick={handleClose}
                      aria-current={current ? 'page' : undefined}
                      className={classMerge(
                        'flex min-h-14 items-center text-lg',
                        current
                          ? 'text-primary font-semibold'
                          : 'text-foreground hover:text-primary',
                      )}>
                      {link.label}
                    </SiteLink>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  )
}
