'use client'

import { CircleAlert, CircleCheck, Info, X } from 'lucide-react-native'
import * as React from 'react'
import { Platform, Pressable, View } from 'react-native'

import { cn } from '../../lib/utils'
import { Icon } from '../Icon'
import { Text } from '../Text'

type ToastVariant = 'default' | 'success' | 'error'

type ToastOptions = {
  description?: string
  /** Milliseconds before it hides. Defaults to 4000. */
  duration?: number
}

type ToastItem = ToastOptions & {
  id: number
  title: string
  variant: ToastVariant
}

// A tiny module-level store so `toast()` works from anywhere (event handlers,
// mutation callbacks) without a hook.
let items: ToastItem[] = []
let nextId = 1
const listeners = new Set<(items: ToastItem[]) => void>()

const emit = () => listeners.forEach((listener) => listener(items))

const dismiss = (id: number) => {
  items = items.filter((item) => item.id !== id)
  emit()
}

const show = (
  variant: ToastVariant,
  title: string,
  options: ToastOptions = {},
) => {
  const id = nextId++
  items = [...items, { id, title, variant, ...options }].slice(-3)
  emit()
  setTimeout(() => dismiss(id), options.duration ?? 4000)
  return id
}

/**
 * Shows a toast. Same call shape on native and web:
 * `toast('Saved')`, `toast.success('Booked')`, `toast.error(message)`.
 */
const toast = Object.assign(
  (title: string, options?: ToastOptions) => show('default', title, options),
  {
    success: (title: string, options?: ToastOptions) =>
      show('success', title, options),
    error: (title: string, options?: ToastOptions) =>
      show('error', title, options),
    dismiss,
  },
)

const VARIANT_ICON = {
  default: Info,
  success: CircleCheck,
  error: CircleAlert,
} as const

function ToastRow({ item }: { item: ToastItem }) {
  return (
    <View>
      <View
        role="alert"
        className="bg-card border-border rounded-card shadow-elevation-3 w-full flex-row items-start gap-3 border p-4">
        <Icon
          as={VARIANT_ICON[item.variant]}
          size={20}
          className={cn(
            item.variant === 'success' && 'text-primary',
            item.variant === 'error' && 'text-destructive',
            item.variant === 'default' && 'text-foreground',
          )}
        />
        <View className="flex-1 gap-0.5">
          <Text className="text-body-sm font-semibold">{item.title}</Text>
          {item.description && (
            <Text className="text-muted-foreground text-body-sm">
              {item.description}
            </Text>
          )}
        </View>
        <Pressable
          accessibilityLabel="Dismiss"
          hitSlop={8}
          onPress={() => dismiss(item.id)}>
          <Icon as={X} size={16} className="text-muted-foreground" />
        </Pressable>
      </View>
    </View>
  )
}

/** Renders the toasts. Mount once at the app root, above the screens. */
function Toaster({ position = 'top' }: { position?: 'top' | 'bottom' }) {
  const [visible, setVisible] = React.useState<ToastItem[]>(items)
  React.useEffect(() => {
    listeners.add(setVisible)
    return () => {
      listeners.delete(setVisible)
    }
  }, [])

  if (visible.length === 0) return null

  return (
    <View
      pointerEvents="box-none"
      className={cn(
        'absolute left-0 right-0 z-50 items-center gap-2 px-4',
        position === 'top'
          ? Platform.select({ native: 'top-14', default: 'top-4' })
          : 'bottom-8',
      )}>
      {visible.map((item) => (
        <View key={item.id} className="w-full max-w-md">
          <ToastRow item={item} />
        </View>
      ))}
    </View>
  )
}

export { toast, Toaster }
export type { ToastOptions, ToastVariant }
