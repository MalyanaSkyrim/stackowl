'use client'

import * as React from 'react'
import { View } from 'react-native'

import { cn } from '../../lib/utils'
import { Text } from '../Text'

type SectionHeaderProps = {
  /** "This week": the group's name, shown as a small uppercase kicker. */
  title: string
  /** A muted note at the end, e.g. "from page 22". */
  detail?: string
  className?: string
}

/**
 * The header over a group of rows in a long list (the notes of a week). Its background is
 * solid, so it can stay pinned at the top while the rows scroll under it.
 */
function SectionHeader({ title, detail, className }: SectionHeaderProps) {
  return (
    <View
      accessibilityRole="header"
      className={cn(
        'bg-background border-border flex-row items-baseline justify-between border-b px-5 pb-1.5 pt-2.5',
        className,
      )}>
      <Text variant="kicker">{title}</Text>
      {detail ? <Text variant="caption">{detail}</Text> : null}
    </View>
  )
}

export { SectionHeader }
export type { SectionHeaderProps }
