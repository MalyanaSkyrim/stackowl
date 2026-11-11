'use client'

import * as React from 'react'
import { View } from 'react-native'

import { cn } from '../../lib/utils'
import { Text } from '../Text'

type BarChartBar = {
  /** Stable key for the bar (its day). */
  key: string
  value: number
  /** Under the bar ("M", "12", "Oct"); bars without one leave the space empty. */
  label?: string
}

type BarChartProps = {
  bars: BarChartBar[]
  /** The bar drawn in gold, for the best day. */
  highlight?: number | null
  /** Height of the tallest bar, in points. */
  height?: number
  /** What the chart shows, read by VoiceOver in place of the bars. */
  accessibilityLabel: string
  className?: string
}

/** The smallest bar still shows, so a day with a little reading isn't an empty slot. */
const MIN_BAR = 4

/**
 * Bars side by side, primary with the best one highlighted. The
 * row follows the reading direction, so in Arabic the first bar is on the right.
 */
function BarChart({
  bars,
  highlight = null,
  height = 96,
  accessibilityLabel,
  className,
}: BarChartProps) {
  const max = Math.max(0, ...bars.map((bar) => bar.value))
  // Many bars (a month) sit closer together.
  const gap = bars.length > 12 ? 'gap-0.5' : 'gap-2'

  return (
    <View
      accessible
      role="img"
      accessibilityLabel={accessibilityLabel}
      className={cn('gap-1.5', className)}>
      <View className={cn('flex-row items-end', gap)} style={{ height }}>
        {bars.map((bar, index) => (
          <View
            key={bar.key}
            className={cn(
              'flex-1',
              bars.length > 12 ? 'rounded-sm' : 'rounded-md',
              bar.value <= 0
                ? 'bg-muted'
                : index === highlight
                  ? 'bg-gold'
                  : 'bg-primary',
            )}
            style={{
              height:
                bar.value <= 0 || max === 0
                  ? MIN_BAR / 2
                  : Math.max(MIN_BAR, (bar.value / max) * height),
            }}
          />
        ))}
      </View>
      <View className={cn('flex-row', gap)}>
        {bars.map((bar) => (
          <Text
            key={bar.key}
            numberOfLines={1}
            className="text-caption text-muted-foreground flex-1 text-center">
            {bar.label ?? ''}
          </Text>
        ))}
      </View>
    </View>
  )
}

export { BarChart }
export type { BarChartBar, BarChartProps }
