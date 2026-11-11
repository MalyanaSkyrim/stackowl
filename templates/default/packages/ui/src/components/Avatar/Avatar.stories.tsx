import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { View } from 'react-native'

import { Avatar } from '.'

const meta: Meta<typeof Avatar> = {
  title: 'Avatar',
  component: Avatar,
  args: { name: 'you@example.com' },
}

export default meta

type Story = StoryObj<typeof Avatar>

export const Default: Story = {}

/** Medium in a Settings row, large on the account screen. */
export const Sizes: Story = {
  render: () => (
    <View className="flex-row items-center gap-4">
      <Avatar name="you@example.com" />
      <Avatar name="Reader" size="lg" />
    </View>
  ),
}
