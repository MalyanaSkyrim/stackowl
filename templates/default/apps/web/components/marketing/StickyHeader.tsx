'use client'

import { classMerge } from '@starter/ui/lib/utils'
import React, { useEffect, useState } from 'react'

/**
 * The sticky header shell: lifts off the page once the visitor scrolls.
 *
 * Only the `<header>` element is a client component. Everything inside it —
 * logo, links, language switcher — is passed in as already-rendered server
 * children, which keeps the `@starter/ui` barrel (and everything it
 * re-exports) out of the client bundle.
 */
export const StickyHeader = ({ children }: { children: React.ReactNode }) => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={classMerge(
        'bg-background/95 border-border sticky top-0 z-40 w-full border-b transition-shadow',
        scrolled && 'shadow-sm backdrop-blur-md',
      )}>
      {children}
    </header>
  )
}
