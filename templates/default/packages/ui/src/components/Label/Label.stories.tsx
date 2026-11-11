import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { View } from 'react-native'

import { Label } from '.'

const meta: Meta<typeof Label> = {
  title: 'Label',
  component: Label,
}

export default meta

type Story = StoryObj<typeof Label>

export const Default: Story = {
  args: { children: 'Email address' },
}

export const Disabled: Story = {
  render: () => (
    <View className="gap-2">
      <Label>Enabled label</Label>
      <Label disabled>Disabled label</Label>
    </View>
  ),
}
