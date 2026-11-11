'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { View } from 'react-native'

import { cn } from '../../lib/utils'
import { Text } from '../Text'

const badgeVariants = cva(
  'h-6 flex-row items-center self-start rounded-full px-2.5',
  {
    variants: {
      variant: {
        // Offers: "7 DAYS FREE". Pro features use ProKey, never a "PRO" pill.
        gold: 'bg-gold',
        // A quiet label on a card.
        secondary: 'bg-secondary',
      },
    },
    defaultVariants: { variant: 'gold' },
  },
)

const badgeTextColor = {
  gold: 'text-gold-foreground',
  secondary: 'text-primary',
} as const

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

type BadgeProps = {
  variant?: BadgeVariant
  /** Short, already translated: "7 days free". */
  label: string
  className?: string
}

/** A small pill with a word or two: a free-trial offer on a plan, a quiet label. */
function Badge({ variant = 'gold', label, className }: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)}>
      <Text
        className={cn('text-caption font-semibold', badgeTextColor[variant])}>
        {label}
      </Text>
    </View>
  )
}

export { Badge }
export type { BadgeProps, BadgeVariant }
