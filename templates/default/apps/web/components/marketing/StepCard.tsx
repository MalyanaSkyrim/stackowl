import React from 'react'

import { SurfaceCard } from './SurfaceCard'

interface StepCardProps {
  /** Already formatted for the locale, so Arabic shows ١ ٢ ٣. */
  step: string
  title: string
  body: string
  art: React.ReactNode
}

/** One numbered step of "How it works": illustration, number, title, body. */
export const StepCard = ({ step, title, body, art }: StepCardProps) => (
  <SurfaceCard tone="page" className="flex h-full flex-col gap-3 p-6 lg:p-7">
    {art}
    <span
      aria-hidden="true"
      className="font-display rtl:font-display-ar text-gold mt-2 text-3xl">
      {step}
    </span>
    <h3 className="type-h3 text-foreground">{title}</h3>
    <p className="text-foreground-soft text-[15px] leading-relaxed">{body}</p>
  </SurfaceCard>
)
