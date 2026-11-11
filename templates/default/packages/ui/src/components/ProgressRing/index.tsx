'use client'

import * as React from 'react'
import { View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

import { useTokenColor } from '../../lib/token-colors'
import { cn } from '../../lib/utils'
import { Text } from '../Text'

type ProgressRingProps = {
  /** How far, from 0 to 1. */
  value: number
  /** Shown in the middle, already formatted ("42%", "٪٤٢"). */
  label: string
  /** 'md' for a tile (40), 'lg' for a hero card (76). */
  size?: 'md' | 'lg'
  /** 'hero' on the primary hero card: a light track. */
  tone?: 'default' | 'hero'
  accessibilityLabel?: string
  className?: string
}

const SIZES = {
  md: { box: 40, stroke: 4, text: 'text-tiny font-semibold' },
  lg: { box: 76, stroke: 7, text: 'text-title-xs font-semibold' },
} as const

/** A gold ring that fills as a goal is reached, with the percentage inside. */
function ProgressRing({
  value,
  label,
  size = 'md',
  tone = 'default',
  accessibilityLabel,
  className,
}: ProgressRingProps) {
  const color = useTokenColor()
  const { box, stroke, text } = SIZES[size]
  const radius = (box - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const filled = Math.min(1, Math.max(0, value)) * circumference
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
      style={{ width: box, height: box }}
      className={cn('items-center justify-center', className)}>
      <Svg width={box} height={box} style={{ position: 'absolute' }}>
        <Circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke={color(tone === 'hero' ? 'hero-foreground' : 'muted')}
          strokeOpacity={tone === 'hero' ? 0.18 : 1}
          strokeWidth={stroke}
        />
        {filled > 0 ? (
          <Circle
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            stroke={color('gold')}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circumference}`}
            transform={`rotate(-90 ${box / 2} ${box / 2})`}
          />
        ) : null}
      </Svg>
      <Text className={cn(text, tone === 'hero' && 'text-hero-foreground')}>
        {label}
      </Text>
    </View>
  )
}

export { ProgressRing }
export type { ProgressRingProps }
