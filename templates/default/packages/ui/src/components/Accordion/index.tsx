'use client'

import * as AccordionPrimitive from '@rn-primitives/accordion'
import { ChevronDown } from 'lucide-react-native'
import * as React from 'react'
import { Platform, Pressable, View } from 'react-native'

import { cn } from '../../lib/utils'
import { Icon } from '../Icon'
import { TextClassContext } from '../Text'

const Accordion = AccordionPrimitive.Root

function AccordionItem({ className, ...props }: AccordionPrimitive.ItemProps) {
  return (
    <AccordionPrimitive.Item
      className={cn('border-border border-b', className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.TriggerProps & { children?: React.ReactNode }) {
  const { isExpanded } = AccordionPrimitive.useItemContext()
  return (
    <TextClassContext.Provider value="text-body-md text-left font-medium">
      <AccordionPrimitive.Header>
        <AccordionPrimitive.Trigger {...props} asChild>
          <Pressable
            className={cn(
              'flex-row items-start justify-between gap-4 rounded-md py-4',
              Platform.select({
                web: 'focus-visible:border-ring focus-visible:ring-ring/50 outline-none transition-all hover:underline focus-visible:ring-[3px]',
              }),
              className,
            )}>
            <View className="flex-1">{children}</View>
            {/* A style, not `rotate-180`: a transform class added on open makes NativeWind
                upgrade the view mid-render, which throws inside React Navigation. */}
            <View
              style={{
                transform: [{ rotate: isExpanded ? '180deg' : '0deg' }],
              }}>
              <Icon
                as={ChevronDown}
                size={16}
                className="text-muted-foreground shrink-0"
              />
            </View>
          </Pressable>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
    </TextClassContext.Provider>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.ContentProps) {
  return (
    <TextClassContext.Provider value="text-body-sm text-foreground-soft">
      <AccordionPrimitive.Content className="overflow-hidden" {...props}>
        <View className={cn('pb-4', className)}>{children}</View>
      </AccordionPrimitive.Content>
    </TextClassContext.Provider>
  )
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
