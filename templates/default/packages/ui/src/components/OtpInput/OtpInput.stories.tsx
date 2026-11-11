import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { View } from 'react-native'

import { OtpInput } from '.'
import { Text } from '../Text'

const meta: Meta<typeof OtpInput> = {
  title: 'OtpInput',
  component: OtpInput,
}

export default meta

type Story = StoryObj<typeof OtpInput>

export const Default: Story = {
  render: function Render() {
    const [value, setValue] = React.useState('')
    return (
      <View className="w-80 gap-2">
        <OtpInput value={value} onChangeText={setValue} autoFocus={false} />
        <Text variant="muted">Entered: {value || '—'}</Text>
      </View>
    )
  },
}

export const PartiallyFilled: Story = {
  render: function Render() {
    const [value, setValue] = React.useState('482')
    return (
      <View className="w-80">
        <OtpInput value={value} onChangeText={setValue} autoFocus={false} />
      </View>
    )
  },
}

export const Invalid: Story = {
  render: function Render() {
    const [value, setValue] = React.useState('123456')
    return (
      <View className="w-80 gap-2">
        <OtpInput
          value={value}
          onChangeText={setValue}
          invalid
          autoFocus={false}
        />
        <Text className="text-destructive text-sm">
          {"That code didn't match."}
        </Text>
      </View>
    )
  },
}
