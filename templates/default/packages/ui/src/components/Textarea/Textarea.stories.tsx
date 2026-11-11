import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { View } from 'react-native'

import { Textarea } from '.'

const meta: Meta<typeof Textarea> = {
  title: 'Textarea',
  component: Textarea,
  args: { placeholder: 'Tell us about your trip' },
}

export default meta

type Story = StoryObj<typeof Textarea>

export const Default: Story = {
  render: (args) => (
    <View className="w-80">
      <Textarea {...args} />
    </View>
  ),
}

export const Invalid: Story = {
  render: () => (
    <View className="w-80">
      <Textarea placeholder="Required" invalid />
    </View>
  ),
}
