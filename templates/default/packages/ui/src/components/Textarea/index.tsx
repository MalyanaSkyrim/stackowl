'use client'

import * as React from 'react'
import { Platform, TextInput, type TextInputProps } from 'react-native'

import { cn } from '../../lib/utils'

type TextareaProps = TextInputProps & { invalid?: boolean }

function Textarea({
  className,
  multiline = true,
  numberOfLines = Platform.select({ web: 3, native: 6 }),
  invalid = false,
  ...props
}: TextareaProps) {
  return (
    <TextInput
      className={cn(
        'text-foreground border-input bg-card rounded-input text-body-md flex min-h-24 w-full flex-row border px-3.5 py-3 font-sans',
        Platform.select({
          web: 'placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-primary resize-y outline-none transition-[color,box-shadow] focus-visible:ring-1 disabled:cursor-not-allowed',
          native: 'placeholder:text-muted-foreground',
        }),
        props.editable === false && 'opacity-50',
        invalid && 'border-destructive',
        className,
      )}
      aria-invalid={invalid}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      {...props}
    />
  )
}

export { Textarea }
export type { TextareaProps }
