import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { useForm } from 'react-hook-form'
import { View } from 'react-native'

import { Form, FormField, FormInput, FormItem, FormLabel, FormMessage } from '.'
import { Button } from '../Button'
import { Switch } from '../Switch'
import { Text } from '../Text'

const meta: Meta<typeof Form> = {
  title: 'Form',
  component: Form,
}

export default meta

type Story = StoryObj<typeof Form>

type SignIn = { email: string; password: string; terms: boolean }

export const SignInForm: Story = {
  render: function Render() {
    const form = useForm<SignIn>({
      defaultValues: { email: '', password: '', terms: false },
      mode: 'onTouched',
    })
    const [submitted, setSubmitted] = React.useState<SignIn | null>(null)
    return (
      <View className="w-80 gap-4">
        <Form form={form}>
          <FormInput
            name="email"
            control={form.control}
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            rules={{
              required: 'Enter your email',
              pattern: { value: /\S+@\S+/, message: 'Enter a valid email' },
            }}
          />
          <FormInput
            name="password"
            control={form.control}
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            enablePasswordToggle
            rules={{
              minLength: { value: 8, message: 'At least 8 characters' },
            }}
          />
          <FormField
            name="terms"
            control={form.control}
            rules={{ validate: (v) => v || 'Accept the terms to continue' }}
            render={({ field }) => (
              <FormItem>
                <View className="flex-row items-center gap-3">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-labelledby="terms"
                  />
                  <FormLabel nativeID="terms">I accept the terms</FormLabel>
                </View>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button onPress={form.handleSubmit(setSubmitted)}>
            <Text>Sign in</Text>
          </Button>
        </Form>
        {submitted && <Text variant="muted">Submitted {submitted.email}</Text>}
      </View>
    )
  },
}
