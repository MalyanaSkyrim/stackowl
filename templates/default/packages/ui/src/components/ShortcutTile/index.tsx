'use client'

import * as React from 'react'
import { Pressable, View } from 'react-native'

import { cn } from '../../lib/utils'
import { Text } from '../Text'

type ShortcutTileProps = {
  /** A ring, an icon in a tinted square... 40 by 40. */
  leading: React.ReactNode
  title: string
  caption?: string
  onPress: () => void
  accessibilityLabel?: string
  className?: string
}

/** A compact tile that opens a screen, e.g. the shortcuts at the top of a home screen. */
function ShortcutTile({
  leading,
  title,
  caption,
  onPress,
  accessibilityLabel,
  className,
}: ShortcutTileProps) {
  return (
    <Pressable
      role="button"
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      className={cn(
        'bg-background border-border rounded-card active:bg-muted h-16 flex-row items-center gap-2.5 border px-3',
        className,
      )}>
      <View
        pointerEvents="none"
        className="h-10 w-10 items-center justify-center">
        {leading}
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-body-sm font-semibold" numberOfLines={1}>
          {title}
        </Text>
        {caption ? (
          <Text variant="caption" numberOfLines={1}>
            {caption}
          </Text>
        ) : null}
      </View>
    </Pressable>
  )
}

export { ShortcutTile }
export type { ShortcutTileProps }
