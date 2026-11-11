import type { Meta, StoryObj } from '@storybook/react'
import { Lock } from 'lucide-react-native'
import * as React from 'react'
import { View } from 'react-native'

import { ActionCard } from '.'
import { ProgressBar } from '../ProgressBar'
import { Text } from '../Text'

const meta: Meta<typeof ActionCard> = {
  title: 'ActionCard',
  component: ActionCard,
}

export default meta

type Story = StoryObj<typeof ActionCard>

export const Variants: Story = {
  render: () => (
    <View className="w-full max-w-sm gap-3">
      <ActionCard
        variant="hero"
        icon={Lock}
        title="3 notes to review"
        description="Pick up where you left off"
        onPress={() => {}}
      />
      <ActionCard
        label="Continue reading"
        title="Project kickoff · edited today"
        trailing="button"
        onPress={() => {}}>
        <View className="flex-row items-center gap-2.5">
          <ProgressBar value={0.23} tone="primary" className="flex-1" />
          <Text>23%</Text>
        </View>
      </ActionCard>
    </View>
  ),
}
