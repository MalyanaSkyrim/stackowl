import type { Meta, StoryObj } from '@storybook/react'
import { Mail, Search } from 'lucide-react-native'
import * as React from 'react'
import { View } from 'react-native'

import { Input } from '.'

const meta: Meta<typeof Input> = {
  title: 'Input',
  component: Input,
  args: { placeholder: 'Email address' },
}

export default meta

type Story = StoryObj<typeof Input>

export const Default: Story = {}

export const States: Story = {
  render: () => (
    <View className="w-80 gap-3">
      <Input placeholder="Default" />
      <Input placeholder="Small" size="sm" />
      <Input placeholder="With icon" leftIcon={Search} />
      <Input placeholder="Email" leftIcon={Mail} keyboardType="email-address" />
      <Input placeholder="Password" secureTextEntry enablePasswordToggle />
      <Input placeholder="Invalid" invalid />
      <Input placeholder="Disabled" editable={false} />
    </View>
  ),
}
