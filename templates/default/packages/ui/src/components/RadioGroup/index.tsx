'use client'

import * as RadioGroupPrimitive from '@rn-primitives/radio-group'
import * as React from 'react'
import { Platform } from 'react-native'

import { cn } from '../../lib/utils'

/** The picked value, so an item can draw its selected ring. */
const RadioGroupValueContext = React.createContext<string | undefined>(
  undefined,
)

function RadioGroup({ className, ...props }: RadioGroupPrimitive.RootProps) {
  return (
    <RadioGroupValueContext.Provider value={props.value}>
      <RadioGroupPrimitive.Root className={cn('gap-3', className)} {...props} />
    </RadioGroupValueContext.Provider>
  )
}

function RadioGroupItem({
  className,
  ...props
}: RadioGroupPrimitive.ItemProps) {
  const value = React.useContext(RadioGroupValueContext)
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        'border-input bg-card aspect-square size-[22px] shrink-0 items-center justify-center rounded-full border-2',
        props.value === value && 'border-primary',
        Platform.select({
          web: 'focus-visible:border-ring focus-visible:ring-ring/50 outline-none transition-all focus-visible:ring-[3px] disabled:cursor-not-allowed',
        }),
        props.disabled && 'opacity-50',
        className,
      )}
      {...props}>
      <RadioGroupPrimitive.Indicator className="bg-primary size-2 rounded-full" />
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
