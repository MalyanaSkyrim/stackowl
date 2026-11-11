'use client'

import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet'
import { cssInterop } from 'nativewind'
import * as React from 'react'
import { View } from 'react-native'

import { TextInputComponentContext } from '../../lib/text-input-context'
import { useTokenColor } from '../../lib/token-colors'
import { cn } from '../../lib/utils'
import type { BottomSheetProps } from './BottomSheet.types'

export type { BottomSheetProps } from './BottomSheet.types'

// gorhom's views aren't React Native's, so NativeWind needs telling where their classes go.
cssInterop(BottomSheetView, { className: 'style' })
cssInterop(BottomSheetScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
})
cssInterop(BottomSheetTextInput, { className: 'style' })

/**
 * Mount once near the app root. On native it hosts the sheets; on the web it
 * renders its children unchanged.
 */
function BottomSheetProvider({ children }: { children: React.ReactNode }) {
  return <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
}

/**
 * Sheet that slides up from the bottom. With `backdrop={false}` it peeks over a page the user
 * keeps reading (a drag up takes it to the next snap point), on the card color with a hairline
 * on top, so it stands apart from the page it covers. Native uses @gorhom/bottom-sheet; the
 * web build (`bottom-sheet.web.tsx`) shows the same API as a dialog pinned to
 * the bottom, because gorhom's gesture stack doesn't run in the browser.
 */
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
  const ref = React.useRef<BottomSheetModal>(null)
  const color = useTokenColor()

  // Whether the sheet is on screen, so a close that an animation swallowed can be retried.
  const isShown = React.useRef(false)

  React.useEffect(() => {
    if (open) {
      isShown.current = true
      ref.current?.present()
      return
    }
    ref.current?.dismiss()
    // A dismiss sent while the sheet is still sizing itself can be dropped: try once more.
    const retry = setTimeout(() => {
      if (isShown.current) ref.current?.dismiss()
    }, 600)
    return () => clearTimeout(retry)
  }, [open])

  const renderBackdrop = React.useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  )

  // A kit `Input` in the sheet uses gorhom's field, which lifts the sheet above the keyboard.
  const body = (
    <TextInputComponentContext.Provider value={BottomSheetTextInput}>
      {children}
      {footer && <View className="pt-4">{footer}</View>}
    </TextInputComponentContext.Provider>
  )

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={enableDynamicSizing ? undefined : snapPoints}
      enableDynamicSizing={enableDynamicSizing}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backdropComponent={backdrop ? renderBackdrop : undefined}
      onDismiss={() => {
        isShown.current = false
        onOpenChange(false)
      }}
      backgroundStyle={
        backdrop
          ? { backgroundColor: color('background') }
          : {
              backgroundColor: color('card'),
              borderTopWidth: 1,
              borderColor: color('border'),
            }
      }
      handleIndicatorStyle={{ backgroundColor: color('border'), width: 40 }}>
      {header ? (
        // The header stays put; only the list under it scrolls.
        <TextInputComponentContext.Provider value={BottomSheetTextInput}>
          <View className="flex-1">
            <View>{header}</View>
            <BottomSheetScrollView
              stickyHeaderIndices={stickyHeaderIndices}
              keyboardShouldPersistTaps="handled"
              contentContainerClassName={className}>
              {children}
            </BottomSheetScrollView>
            {footer ? <View className="px-6 pb-6 pt-4">{footer}</View> : null}
          </View>
        </TextInputComponentContext.Provider>
      ) : scrollable ? (
        <BottomSheetScrollView contentContainerClassName={cn('p-6', className)}>
          {body}
        </BottomSheetScrollView>
      ) : (
        <BottomSheetView className={cn('p-6', className)}>
          {body}
        </BottomSheetView>
      )}
    </BottomSheetModal>
  )
}

export { BottomSheet, BottomSheetProvider }
