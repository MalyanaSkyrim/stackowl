import React from 'react'

import { SurfaceCard } from './SurfaceCard'

interface FeatureCardProps {
  title: string
  body: string
  /** A short tag after the title, such as "Pro". */
  badge?: string
}

/**
 * A feature in the "Made for reading" grid. `h-full` keeps a row even:
 * French runs ~35% longer than English.
 */
export const FeatureCard = ({ title, body, badge }: FeatureCardProps) => (
  <SurfaceCard className="flex h-full flex-col gap-2.5 p-6 lg:p-7">
    <h3 className="text-foreground flex items-center gap-2 text-lg font-semibold">
      {title}
      {badge && (
        <span className="bg-accent text-accent-foreground rounded-full px-2 py-0.5 text-xs font-semibold">
          {badge}
        </span>
      )}
    </h3>
    <p className="text-foreground-soft text-[15px] leading-relaxed">{body}</p>
  </SurfaceCard>
)
