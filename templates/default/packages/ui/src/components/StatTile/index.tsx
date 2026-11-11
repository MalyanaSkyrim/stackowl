'use client'

import * as React from 'react'
import { Pressable } from 'react-native'

import { cn } from '../../lib/utils'
import { Text } from '../Text'

type StatTileProps = {
  /** What the number is ("Notes this week"). */
  label: string
  /** The number, large ("1 / 2"). */
  value: string
  /** A line under the number ("pages"). */
  caption?: string
  /** `primary` draws the caption in the brand color, for good news ("Done"). */
  captionTone?: 'muted' | 'primary'
  onPress?: () => void
  className?: string
}

/** A small card with one number, used two side by side on the Home screen. */
function StatTile({
  label,
  value,
  caption,
  captionTone = 'muted',
  onPress,
  className,
}: StatTileProps) {
  return (
    <Pressable
      role={onPress ? 'button' : undefined}
      accessibilityLabel={[label, value, caption].filter(Boolean).join(', ')}
      onPress={onPress}
      disabled={!onPress}
      className={cn(
        'rounded-card bg-card border-border active:bg-muted gap-1 border p-4',
        className,
      )}>
      <Text className="text-caption text-muted-foreground">{label}</Text>
      <Text variant="h2">{value}</Text>
      {caption ? (
        <Text
          className={cn(
            'text-caption',
            captionTone === 'primary'
              ? 'text-primary font-medium'
              : 'text-muted-foreground',
          )}>
          {caption}
        </Text>
      ) : null}
    </Pressable>
  )
}

export { StatTile }
export type { StatTileProps }
