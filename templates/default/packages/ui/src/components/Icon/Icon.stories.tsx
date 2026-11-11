import type { Meta, StoryObj } from '@storybook/react'
import { Car, Heart, Search, Star } from 'lucide-react-native'
import * as React from 'react'
import { View } from 'react-native'

import { Icon } from '.'

const meta: Meta<typeof Icon> = {
  title: 'Icon',
  component: Icon,
}

export default meta

type Story = StoryObj<typeof Icon>

export const Default: Story = {
  args: { as: Search, size: 24 },
}

export const ColoredWithClasses: Story = {
  render: () => (
    <View className="flex-row gap-4">
      <Icon as={Car} size={24} />
      <Icon as={Star} size={24} className="text-primary" />
      <Icon as={Heart} size={24} className="text-destructive" />
      <Icon as={Search} size={24} className="text-muted-foreground" />
    </View>
  ),
}
