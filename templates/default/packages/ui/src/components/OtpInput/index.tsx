'use client'

import * as React from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'
import { I18nManager, View } from 'react-native'
import {
  CodeField,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field'

import { cn } from '../../lib/utils'
import { FormField, FormItem, FormMessage, type FormInputProps } from '../Form'
import { Text } from '../Text'

export const OTP_LENGTH = 6

type OtpInputProps = {
  /** The digits entered so far. */
  value: string
  onChangeText: (value: string) => void
  /** Number of boxes. Defaults to 6. */
  length?: number
  invalid?: boolean
  autoFocus?: boolean
  className?: string
}

/**
 * One-time-code field with a box per digit. `CodeField` stretches a single
 * TextInput over the boxes, which keeps paste, backspace and OS autofill
 * working on native and web.
 */
function OtpInput({
  value,
  onChangeText,
  length = OTP_LENGTH,
  invalid = false,
  autoFocus = true,
  className,
}: OtpInputProps) {
  const ref = useBlurOnFulfill({ value, cellCount: length })
  const [codeFieldProps, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue: onChangeText,
  })

  return (
    <View className={cn('w-full', className)}>
      <CodeField
        ref={ref}
        {...codeFieldProps}
        value={value}
        onChangeText={(text: string) =>
          onChangeText(text.replace(/\D/g, '').slice(0, length))
        }
        cellCount={length}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        // A code always reads left to right, so undo the RTL row flip.
        rootStyle={{
          flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
          gap: 8,
        }}
        renderCell={({ index, symbol, isFocused }) => (
          <View
            key={index}
            onLayout={getCellOnLayoutHandler(index)}
            className={cn(
              'bg-card h-14 flex-1 items-center justify-center rounded-xl',
              invalid
                ? 'border-destructive'
                : isFocused
                  ? 'border-primary border-2'
                  : 'border-input border',
            )}>
            <Text className="font-display text-title-md">{symbol}</Text>
          </View>
        )}
      />
    </View>
  )
}

type FormOtpInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Pick<FormInputProps<TFieldValues, TName>, 'name' | 'control' | 'rules'> &
  Pick<OtpInputProps, 'length' | 'autoFocus'>

/** OTP field and error message bound to a react-hook-form field. */
function FormOtpInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  rules,
  length,
  autoFocus,
}: FormOtpInputProps<TFieldValues, TName>) {
  return (
    <FormField
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <FormItem>
          <OtpInput
            value={typeof field.value === 'string' ? field.value : ''}
            onChangeText={field.onChange}
            invalid={fieldState.invalid}
            length={length}
            autoFocus={autoFocus}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export { FormOtpInput, OtpInput }
export type { FormOtpInputProps, OtpInputProps }
