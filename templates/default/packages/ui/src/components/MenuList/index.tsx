'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import * as React from 'react'
import { I18nManager, Pressable, View } from 'react-native'

import { cn } from '../../lib/utils'
import { Icon } from '../Icon'
import { Text } from '../Text'

type MenuListItemProps = {
  icon?: React.ReactNode
  title: string
  /** A second, muted line under the title. */
  description?: string
  /** Shown at the end of the row, before the chevron. */
  value?: string | React.ReactNode
  onPress?: () => void
  /** Divider under the row; MenuList sets it on every row but the last. */
  hasBorder?: boolean
  showChevron?: boolean
  className?: string
}

type MenuListProps = {
  items: Omit<MenuListItemProps, 'hasBorder'>[]
  className?: string
}

// The chevron points forward: right in left-to-right languages, left in Arabic.
const ForwardChevron = I18nManager.isRTL ? ChevronLeft : ChevronRight

/** One settings-style row: icon, title, optional value and chevron. */
function MenuListItem({
  icon,
  title,
  description,
  value,
  onPress,
  hasBorder = false,
  showChevron = true,
  className,
}: MenuListItemProps) {
  return (
    <Pressable
      role={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      className={cn(
        'bg-card active:bg-muted min-h-[52px] flex-row items-center justify-between gap-3 px-4 py-3.5',
        hasBorder && 'border-muted border-b',
        className,
      )}>
      <View className="flex-1 flex-row items-center gap-3">
        {/* Callers pass raw lucide icons: keep their SVG from taking the row's tap. */}
        <View pointerEvents="none">{icon}</View>
        {/* A long title (an email) truncates instead of running under the value. */}
        {description ? (
          <View className="shrink gap-0.5">
            <Text className="text-body-md" numberOfLines={1}>
              {title}
            </Text>
            <Text className="text-body-sm text-muted-foreground">
              {description}
            </Text>
          </View>
        ) : (
          <Text className="text-body-md shrink" numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>
      <View className="shrink-0 flex-row items-center gap-2">
        {typeof value === 'string' ? (
          <Text className="text-muted-foreground text-body-sm">{value}</Text>
        ) : (
          value
        )}
        {showChevron && onPress && (
          <Icon
            as={ForwardChevron}
            size={18}
            className="text-muted-foreground"
          />
        )}
      </View>
    </Pressable>
  )
}

/** A rounded card of MenuListItems, as in the profile and settings screens. */
function MenuList({ items, className }: MenuListProps) {
  return (
    <View
      className={cn(
        'bg-card border-border rounded-card overflow-hidden border',
        className,
      )}>
      {items.map((item, index) => (
        <MenuListItem
          key={`${item.title}-${index}`}
          {...item}
          hasBorder={index < items.length - 1}
        />
      ))}
    </View>
  )
}

export { MenuList, MenuListItem }
export type { MenuListItemProps, MenuListProps }
