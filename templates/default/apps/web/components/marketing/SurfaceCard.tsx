import { classMerge } from '@starter/ui/lib/utils'
import React from 'react'

interface SurfaceCardProps {
  children: React.ReactNode
  /** `page` sits on white bands, `card` (white) on the page background. */
  tone?: 'card' | 'page'
  className?: string
}

/**
 * The one card surface on the site: the app's 22px large-card radius on
 * either surface, so every card-like block goes through here.
 */
export const SurfaceCard = ({
  children,
  tone = 'card',
  className,
}: SurfaceCardProps) => (
  <div
    className={classMerge(
      'rounded-card-lg',
      tone === 'card' ? 'bg-card border-border border' : 'bg-background',
      className,
    )}>
    {children}
  </div>
)
