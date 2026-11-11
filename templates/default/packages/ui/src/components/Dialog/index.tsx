'use client'

import * as DialogPrimitive from '@rn-primitives/dialog'
import { X } from 'lucide-react-native'
import * as React from 'react'
import { Platform, View, type ViewProps } from 'react-native'

import { cn } from '../../lib/utils'
import { Icon } from '../Icon'
import { useFontClasses } from '../Text'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

function DialogOverlay({
  className,
  children,
  ...props
}: DialogPrimitive.OverlayProps & { children?: React.ReactNode }) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        'absolute bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center bg-[rgba(14,21,20,0.45)] p-2',
        Platform.select({ web: 'fixed cursor-default [&>*]:cursor-auto' }),
        className,
      )}
      {...props}>
      {children}
    </DialogPrimitive.Overlay>
  )
}

function DialogContent({
  className,
  portalHost,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.ContentProps & {
  portalHost?: string
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal hostName={portalHost}>
      <DialogOverlay>
        <DialogPrimitive.Content
          className={cn(
            'bg-background border-border rounded-sheet shadow-elevation-3 z-50 mx-auto flex w-full max-w-[calc(100%-2rem)] flex-col gap-3.5 border px-5 py-6 sm:max-w-lg',
            className,
          )}
          {...props}>
          <>
            {children}
            {showCloseButton && (
              <DialogPrimitive.Close
                accessibilityLabel="Close"
                hitSlop={12}
                className={cn(
                  'absolute right-4 top-4 rounded opacity-70 active:opacity-100',
                  Platform.select({
                    web: 'focus:ring-ring transition-opacity hover:opacity-100 focus:outline-none focus:ring-2',
                  }),
                )}>
                <Icon as={X} size={20} className="text-foreground" />
              </DialogPrimitive.Close>
            )}
          </>
        </DialogPrimitive.Content>
      </DialogOverlay>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.TitleProps) {
  return (
    <DialogPrimitive.Title
      className={useFontClasses(
        cn('text-foreground text-title-md font-display', className),
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.DescriptionProps) {
  return (
    <DialogPrimitive.Description
      className={useFontClasses(
        cn('text-foreground-soft text-body-sm font-sans', className),
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
