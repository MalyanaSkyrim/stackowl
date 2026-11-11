'use client'

import type { LucideIcon } from 'lucide-react-native'
import * as React from 'react'
import { View } from 'react-native'

import { cn } from '../../lib/utils'
import { Icon } from '../Icon'
import { Text } from '../Text'

type InfoListItem = {
  icon: LucideIcon
  title: string
  description: string
}

type InfoListProps = {
  items: InfoListItem[]
  className?: string
}

/**
 * Short explanations, each with an icon in an primary circle, a title and a line or two of
 * text: "how it works" guides and feature lists.
 */
function InfoList({ items, className }: InfoListProps) {
  return (
    <View className={cn('gap-6', className)}>
      {items.map((item) => (
        <View key={item.title} className="flex-row gap-3.5">
          <View className="bg-secondary size-10 items-center justify-center rounded-full">
            <Icon as={item.icon} size={20} className="text-primary" />
          </View>
          <View className="flex-1 gap-0.5">
            <Text className="font-semibold">{item.title}</Text>
            <Text className="text-body-sm text-foreground-soft">
              {item.description}
            </Text>
          </View>
        </View>
      ))}
    </View>
  )
}

export { InfoList }
export type { InfoListItem, InfoListProps }
