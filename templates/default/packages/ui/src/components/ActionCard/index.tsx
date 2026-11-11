'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react-native'
import * as React from 'react'
import { I18nManager, Pressable, View } from 'react-native'

import { cn } from '../../lib/utils'
import { Icon } from '../Icon'
import { Text, TextClassContext } from '../Text'

const actionCardVariants = cva('rounded-card gap-3 p-[18px]', {
  variants: {
    variant: {
      // The primary fill: the one status that matters most on a screen.
      hero: 'bg-hero active:bg-hero-hover',
      // A plain card with an outline.
      card: 'bg-card border-border active:bg-muted border',
    },
  },
  defaultVariants: { variant: 'card' },
})

type ActionCardVariant = NonNullable<
  VariantProps<typeof actionCardVariants>['variant']
>

const colors = {
  hero: {
    label: 'text-hero-foreground/85',
    title: 'text-hero-foreground',
    body: 'text-hero-foreground/85',
    tile: 'bg-hero-foreground/15',
    icon: 'text-hero-foreground',
    button: 'bg-hero-foreground',
    buttonIcon: 'text-hero',
  },
  card: {
    label: 'text-muted-foreground',
    title: 'text-card-foreground',
    body: 'text-muted-foreground',
    tile: 'bg-secondary',
    icon: 'text-primary',
    button: 'bg-hero',
    buttonIcon: 'text-hero-foreground',
  },
} as const

// The chevron points forward: right in left-to-right languages, left in Arabic.
const ForwardChevron = I18nManager.isRTL ? ChevronLeft : ChevronRight

type ActionCardProps = {
  variant?: ActionCardVariant
  /** Drawn in a rounded tile at the start of the card. */
  icon?: LucideIcon
  /** A small line above the title ("Continue reading"). */
  label?: string
  title: string
  description?: string
  /**
   * The forward sign at the end: a plain chevron, or a filled round button for the screen's
   * main way in ("Continue reading").
   */
  trailing?: 'chevron' | 'button'
  /** More content across the whole card under the text, such as a progress bar. */
  children?: React.ReactNode
  onPress: () => void
  className?: string
}

/**
 * A card that opens another screen: optional icon tile, label, title and text, a forward
 * chevron or round button, and optional content under them. The Home screen is built from
 * these (a status, continue where you left off).
 */
function ActionCard({
  variant = 'card',
  icon,
  label,
  title,
  description,
  trailing = 'chevron',
  children,
  onPress,
  className,
}: ActionCardProps) {
  const color = colors[variant]
  return (
    <Pressable
      role="button"
      accessibilityLabel={[label, title, description]
        .filter(Boolean)
        .join(', ')}
      onPress={onPress}
      className={cn(actionCardVariants({ variant }), className)}>
      <View className="flex-row items-center gap-3.5">
        {icon ? (
          <View
            pointerEvents="none"
            className={cn(
              'size-11 shrink-0 items-center justify-center rounded-xl',
              color.tile,
            )}>
            <Icon as={icon} size={22} className={color.icon} />
          </View>
        ) : null}
        <View className="flex-1 gap-0.5">
          {label ? (
            <Text className={cn('text-caption', color.label)}>{label}</Text>
          ) : null}
          <Text className={cn('text-title-xs font-semibold', color.title)}>
            {title}
          </Text>
          {description ? (
            <Text className={cn('text-body-sm', color.body)}>
              {description}
            </Text>
          ) : null}
        </View>
        {trailing === 'button' ? (
          <View
            pointerEvents="none"
            className={cn(
              'size-10 items-center justify-center rounded-full',
              color.button,
            )}>
            <Icon as={ForwardChevron} size={18} className={color.buttonIcon} />
          </View>
        ) : (
          <Icon as={ForwardChevron} size={18} className={color.body} />
        )}
      </View>
      {children ? (
        <TextClassContext.Provider value={cn('text-caption', color.body)}>
          {children}
        </TextClassContext.Provider>
      ) : null}
    </Pressable>
  )
}

export { ActionCard }
export type { ActionCardProps, ActionCardVariant }
