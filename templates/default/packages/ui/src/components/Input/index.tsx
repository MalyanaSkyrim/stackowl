'use client'

import { Eye, EyeOff, type LucideIcon } from 'lucide-react-native'
import * as React from 'react'
import { Platform, Pressable, View, type TextInputProps } from 'react-native'

import { TextInputComponentContext } from '../../lib/text-input-context'
import { cn } from '../../lib/utils'
import { Icon } from '../Icon'

type InputProps = TextInputProps & {
  /** `default` is 48px tall, `sm` 40px (design canvas). */
  size?: 'default' | 'sm'
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  /** Adds an eye button that shows or hides a `secureTextEntry` value. */
  enablePasswordToggle?: boolean
  /** Error styling; set by `FormInput` from the field state. */
  invalid?: boolean
}

function Input({
  className,
  size = 'default',
  leftIcon,
  rightIcon,
  enablePasswordToggle = false,
  secureTextEntry,
  invalid = false,
  editable,
  ...props
}: InputProps) {
  const [revealed, setRevealed] = React.useState(false)
  // Inside a BottomSheet this is the sheet's own field, so the keyboard never covers it.
  const TextInput = React.useContext(TextInputComponentContext)
  const hasRightSlot = Boolean(rightIcon) || enablePasswordToggle

  const field = (
    <TextInput
      className={cn(
        'border-input bg-card text-foreground text-body-md flex w-full min-w-0 flex-row items-center border px-3.5 py-1 font-sans',
        size === 'sm' ? 'rounded-input h-10' : 'rounded-input h-12',
        editable === false &&
          cn(
            'opacity-50',
            Platform.select({
              web: 'disabled:pointer-events-none disabled:cursor-not-allowed',
            }),
          ),
        Platform.select({
          web: cn(
            'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none transition-[color,box-shadow]',
            'focus-visible:border-primary focus-visible:ring-primary focus-visible:ring-1',
          ),
          native: 'placeholder:text-muted-foreground',
        }),
        invalid && 'border-destructive',
        leftIcon && 'pl-10',
        hasRightSlot && 'pr-10',
        className,
      )}
      aria-invalid={invalid}
      editable={editable}
      secureTextEntry={Boolean(secureTextEntry) && !revealed}
      {...props}
    />
  )

  if (!leftIcon && !hasRightSlot) return field

  return (
    <View className="relative w-full justify-center">
      {leftIcon && (
        <View pointerEvents="none" className="absolute left-3 z-10">
          <Icon as={leftIcon} size={18} className="text-muted-foreground" />
        </View>
      )}
      {field}
      {enablePasswordToggle ? (
        <Pressable
          role="button"
          accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
          onPress={() => setRevealed((current) => !current)}
          hitSlop={8}
          className="absolute right-3 z-10">
          <Icon
            as={revealed ? EyeOff : Eye}
            size={18}
            className="text-muted-foreground"
          />
        </Pressable>
      ) : (
        rightIcon && (
          <View pointerEvents="none" className="absolute right-3 z-10">
            <Icon as={rightIcon} size={18} className="text-muted-foreground" />
          </View>
        )
      )}
    </View>
  )
}

export { Input }
export type { InputProps }
