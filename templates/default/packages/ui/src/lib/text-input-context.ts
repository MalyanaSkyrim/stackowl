'use client'

import * as React from 'react'
import { TextInput, type TextInputProps } from 'react-native'

/** Any component that takes `TextInput`'s props: React Native's, or a sheet's (a memo). */
type TextInputComponent = React.ElementType<TextInputProps>

/**
 * The text field `Input` draws. React Native's `TextInput` by default; a native `BottomSheet`
 * swaps in its own, which lifts the sheet above the keyboard when the field is focused.
 */
const TextInputComponentContext =
  React.createContext<TextInputComponent>(TextInput)

export { TextInputComponentContext }
export type { TextInputComponent }
