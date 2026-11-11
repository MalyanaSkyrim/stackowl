'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { View, type ViewProps } from 'react-native'

import { cn } from '../../lib/utils'

const progressTrackVariants = cva('bg-muted w-full overflow-hidden', {
  variants: {
    size: {
      // Task progress.
      default: 'h-1.5 rounded-full',
      // Onboarding steps, one bar per step.
      sm: 'h-1 rounded-sm',
    },
  },
  defaultVariants: { size: 'default' },
})

const progressFillVariants = cva('h-full rounded-full', {
  variants: {
    tone: {
      // Highlights.
      gold: 'bg-gold',
      primary: 'bg-primary',
    },
  },
  defaultVariants: { tone: 'gold' },
})

type ProgressBarProps = Omit<ViewProps, 'children'> &
  VariantProps<typeof progressTrackVariants> &
  VariantProps<typeof progressFillVariants> & {
    /** How much is done, from 0 to `max`. */
    value: number
    max?: number
  }

/** A horizontal progress bar: an empty track and a fill. */
function ProgressBar({
  value,
  max = 1,
  size,
  tone,
  className,
  ...props
}: ProgressBarProps) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0
  return (
    <View
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn(progressTrackVariants({ size }), className)}
      {...props}>
      <View
        className={progressFillVariants({ tone })}
        style={{ width: `${ratio * 100}%` }}
      />
    </View>
  )
}

export { ProgressBar }
export type { ProgressBarProps }
