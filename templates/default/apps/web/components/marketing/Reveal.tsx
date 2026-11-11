'use client'

import { classMerge } from '@starter/ui/lib/utils'
import React, { useEffect, useRef, useState } from 'react'

interface RevealProps {
  children: React.ReactNode
  /** Milliseconds to hold the entrance back, so a grid staggers by index. */
  delay?: number
  className?: string
}

/**
 * Fades and lifts its children into view the first time they are scrolled to.
 *
 * Hand-rolled rather than pulled from `motion`: that library is a dependency
 * but is not otherwise on this page, and the marketing bundle is kept
 * deliberately small for ad traffic arriving in mobile in-app browsers. An
 * observer costs nothing and reuses the pattern the sticky CTA bar already
 * used.
 *
 * The animation itself lives in `marketing.css` behind
 * `prefers-reduced-motion: no-preference`, so a visitor who asked for less
 * motion simply sees the content. The `<noscript>` override in the layout
 * covers the case where JavaScript never arrives.
 */
export const Reveal = ({ children, delay = 0, className }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const target = ref.current
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setVisible(true)
        // One-shot: the section never fades back out on the way up.
        observer.disconnect()
      },
      { rootMargin: '0px 0px -10% 0px' },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={classMerge('reveal', visible && 'reveal-visible', className)}>
      {children}
    </div>
  )
}
