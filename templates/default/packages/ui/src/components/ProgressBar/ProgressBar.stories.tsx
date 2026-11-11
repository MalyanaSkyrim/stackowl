import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { View } from 'react-native'

import { ProgressBar } from '.'
import { Text } from '../Text'

const meta: Meta<typeof ProgressBar> = {
  title: 'ProgressBar',
  component: ProgressBar,
}

export default meta

type Story = StoryObj<typeof ProgressBar>

export const Default: Story = {
  render: () => (
    <View className="gap-6">
      <View className="flex-row items-center gap-2.5">
        <ProgressBar value={2} max={3} className="flex-1" />
        <Text variant="caption">2/3</Text>
      </View>
      <ProgressBar value={0.23} tone="primary" />
      <View className="flex-row gap-1.5">
        {[1, 1, 0, 0, 0, 0].map((done, index) => (
          <ProgressBar
            key={index}
            value={done}
            size="sm"
            tone="primary"
            className="flex-1"
          />
        ))}
      </View>
    </View>
  ),
}
