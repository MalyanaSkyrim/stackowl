'use client'

import * as React from 'react'
import { View, type ViewProps } from 'react-native'

import { cn } from '../../lib/utils'

/** Placeholder block shown while content loads. Size it with classes. */
function Skeleton({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn('bg-muted rounded-input animate-pulse', className)}
      {...props}
    />
  )
}

export { Skeleton }
