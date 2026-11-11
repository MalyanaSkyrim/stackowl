'use client'

import * as DialogPrimitive from '@rn-primitives/dialog'
import * as React from 'react'
import { ScrollView, View } from 'react-native'

import { cn } from '../../lib/utils'
import type { BottomSheetProps } from './BottomSheet.types'

export type { BottomSheetProps } from './BottomSheet.types'

// Web build of bottom-sheet.tsx: same API, rendered as a dialog pinned to the
// bottom of the viewport.

function BottomSheetProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function BottomSheet({
  open,
  onOpenChange,
  snapPoints = ['50%'],
  enableDynamicSizing = false,
  scrollable = false,
  backdrop = true,
  header,
  stickyHeaderIndices,
  footer,
  className,
  children,
}: BottomSheetProps) {
  const height = enableDynamicSizing ? undefined : snapPoints[0]
  const body = (
    <>
      <View className="bg-border mx-auto mt-3 h-1 w-10 rounded-full" />
      {header ? (
        <>
          <View>{header}</View>
          <ScrollView
            className="flex-1"
            stickyHeaderIndices={stickyHeaderIndices}
            contentContainerClassName={className}>
            {children}
          </ScrollView>
        </>
      ) : scrollable ? (
        <ScrollView contentContainerClassName={cn('p-6', className)}>
          {children}
        </ScrollView>
      ) : (
        <View className={cn('flex-1 p-6', className)}>{children}</View>
      )}
      {footer && <View className="px-6 pb-6">{footer}</View>}
    </>
  )
  // Without a backdrop the sheet is no dialog: the page around it keeps its taps.
  if (!backdrop) {
    return open ? (
      <View
        style={{ height }}
        className="bg-card border-border rounded-t-sheet shadow-elevation-3 fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-h-[90%] w-full max-w-xl flex-col border-t">
        {body}
      </View>
    ) : null
  }
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 flex justify-end bg-[rgba(14,21,20,0.45)]">
          <DialogPrimitive.Content
            style={{ height }}
            className="bg-background rounded-t-sheet shadow-elevation-3 fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-h-[90%] w-full max-w-xl flex-col">
            {body}
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export { BottomSheet, BottomSheetProvider }
