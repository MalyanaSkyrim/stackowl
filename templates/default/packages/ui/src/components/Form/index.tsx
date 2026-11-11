'use client'

import * as React from 'react'
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from 'react-hook-form'
import { View, type ViewProps } from 'react-native'

import { cn } from '../../lib/utils'
import { Input, type InputProps } from '../Input'
import { Label } from '../Label'
import { Text, type TextProps } from '../Text'

type FormProps<TFieldValues extends FieldValues> = {
  /** The object returned by `useForm`. Submit with `form.handleSubmit(fn)`. */
  form: UseFormReturn<TFieldValues>
  children: React.ReactNode
}

/** Provides a react-hook-form instance to the fields inside it. */
function Form<TFieldValues extends FieldValues>({
  form,
  children,
}: FormProps<TFieldValues>) {
  return <FormProvider {...form}>{children}</FormProvider>
}

const FormFieldContext = React.createContext<{ name: string } | null>(null)

/** A react-hook-form `Controller` that lets FormLabel / FormMessage find its state. */
function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

function useFormField() {
  const field = React.useContext(FormFieldContext)
  const { getFieldState, formState } = useFormContext()
  if (!field) {
    throw new Error('useFormField must be used inside <FormField>')
  }
  return { name: field.name, ...getFieldState(field.name, formState) }
}

function FormItem({ className, ...props }: ViewProps) {
  return <View className={cn('gap-2', className)} {...props} />
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  const { error } = useFormField()
  return (
    <Label className={cn(error && 'text-destructive', className)} {...props} />
  )
}

function FormDescription({ className, ...props }: TextProps) {
  return (
    <Text
      className={cn('text-muted-foreground text-body-sm', className)}
      {...props}
    />
  )
}

/** The field's validation message, or nothing while it is valid. */
function FormMessage({ className, children, ...props }: TextProps) {
  const { error } = useFormField()
  const body = error?.message ?? children
  if (!body) return null
  return (
    <Text className={cn('text-destructive text-body-sm', className)} {...props}>
      {body}
    </Text>
  )
}

type FormInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<InputProps, 'value' | 'defaultValue' | 'onChangeText' | 'invalid'> &
  Pick<
    ControllerProps<TFieldValues, TName>,
    'name' | 'control' | 'rules' | 'defaultValue' | 'shouldUnregister'
  > & {
    label?: string
    description?: string
  }

/** Label, input and error message for one string field. */
function FormInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  rules,
  defaultValue,
  shouldUnregister,
  label,
  description,
  ...inputProps
}: FormInputProps<TFieldValues, TName>) {
  return (
    <FormField
      name={name}
      control={control}
      rules={rules}
      defaultValue={defaultValue}
      shouldUnregister={shouldUnregister}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && (
            <FormLabel disabled={inputProps.editable === false}>
              {label}
            </FormLabel>
          )}
          <Input
            {...inputProps}
            value={typeof field.value === 'string' ? field.value : ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            invalid={fieldState.invalid}
          />
          {description && !fieldState.error && (
            <FormDescription>{description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export {
  Form,
  FormDescription,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
}
export type { FormInputProps, FormProps }
