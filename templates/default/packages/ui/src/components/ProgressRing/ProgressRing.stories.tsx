import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { View } from 'react-native'

import { ProgressRing } from '.'

const meta: Meta<typeof ProgressRing> = {
  title: 'ProgressRing',
  component: ProgressRing,
  args: { value: 0.42, label: '42%' },
}

export default meta

type Story = StoryObj<typeof ProgressRing>

export const Tile: Story = {}

/** On a filled hero card. */
export const Hero: Story = {
  render: () => (
    <View className="bg-hero rounded-card-lg self-start p-4">
      <ProgressRing value={0.42} label="42%" size="lg" tone="hero" />
    </View>
  ),
}
