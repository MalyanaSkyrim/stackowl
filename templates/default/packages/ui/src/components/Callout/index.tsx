'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import type { LucideIcon } from 'lucide-react-native'
import * as React from 'react'
import { View } from 'react-native'

import { cn } from '../../lib/utils'
import { Icon } from '../Icon'
import { Text, TextClassContext } from '../Text'

const calloutVariants = cva('rounded-card gap-2 p-4', {
  variants: {
    variant: {
      // Gold tint: something to know, e.g. "this applies tomorrow".
      accent: 'bg-accent',
      // Primary tint: a gentle nudge, e.g. "finish a draft?".
      secondary: 'bg-secondary',
      // The primary fill: the main status of a screen.
      hero: 'bg-hero p-[18px]',
      // A plain card with an outline.
      card: 'bg-card border-border border p-[18px]',
    },
  },
  defaultVariants: { variant: 'accent' },
})

const titleColor = {
  accent: 'text-accent-foreground',
  secondary: 'text-foreground',
  hero: 'text-hero-foreground',
  card: 'text-card-foreground',
} as const

const bodyColor = {
  accent: 'text-accent-foreground',
  secondary: 'text-foreground',
  hero: 'text-hero-foreground/85',
  card: 'text-muted-foreground',
} as const

type CalloutVariant = NonNullable<
  VariantProps<typeof calloutVariants>['variant']
>

type CalloutProps = {
  variant?: CalloutVariant
  icon?: LucideIcon
  title?: string
  description?: string
  /** More content under the description: a list, an action button… */
  children?: React.ReactNode
  className?: string
}

/**
 * A tinted box with an optional icon, title and text: notes ("applies tomorrow"), nudges and
 * a screen's status. Text inside takes the variant's color.
 */
function Callout({
  variant = 'accent',
  icon,
  title,
  description,
  children,
  className,
}: CalloutProps) {
  return (
    <View className={cn(calloutVariants({ variant }), className)}>
      {icon || title ? (
        <View className="flex-row items-center gap-2">
          {icon ? (
            <Icon as={icon} size={18} className={titleColor[variant]} />
          ) : null}
          {title ? (
            <Text
              className={cn(
                'text-title-xs flex-1 font-semibold',
                titleColor[variant],
              )}>
              {title}
            </Text>
          ) : null}
        </View>
      ) : null}
      {description ? (
        <Text className={cn('text-body-sm', bodyColor[variant])}>
          {description}
        </Text>
      ) : null}
      {children ? (
        <TextClassContext.Provider
          value={cn('text-body-sm', bodyColor[variant])}>
          {children}
        </TextClassContext.Provider>
      ) : null}
    </View>
  )
}

export { Callout }
export type { CalloutProps, CalloutVariant }
