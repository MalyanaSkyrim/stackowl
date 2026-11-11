'use client'

import * as React from 'react'
import { View, type ViewProps } from 'react-native'

import { cn } from '../../lib/utils'
import { Text, TextClassContext, type TextProps } from '../Text'

function Card({ className, ...props }: ViewProps) {
  return (
    <TextClassContext.Provider value="text-card-foreground">
      <View
        className={cn(
          'bg-card border-border rounded-card flex flex-col gap-4 border py-[18px]',
          className,
        )}
        {...props}
      />
    </TextClassContext.Provider>
  )
}

function CardHeader({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn('flex flex-col gap-1.5 px-[18px]', className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: TextProps) {
  return (
    <Text
      role="heading"
      aria-level={3}
      className={cn('text-title-xs font-semibold', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn('text-muted-foreground text-body-sm', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: ViewProps) {
  return <View className={cn('px-[18px]', className)} {...props} />
}

function CardFooter({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn('flex flex-row items-center px-[18px]', className)}
      {...props}
    />
  )
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
