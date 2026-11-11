import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { View } from 'react-native'

import { StatTile } from '.'

const meta: Meta<typeof StatTile> = {
  title: 'StatTile',
  component: StatTile,
}

export default meta

type Story = StoryObj<typeof StatTile>

export const Pair: Story = {
  render: () => (
    <View className="w-full max-w-sm flex-row gap-3">
      <StatTile
        className="flex-1"
        label="Notes this week"
        value="1 / 2"
        caption="pages"
        onPress={() => {}}
      />
      <StatTile
        className="flex-1"
        label="Shared"
        value="23%"
        caption="with 2 people"
        captionTone="primary"
      />
    </View>
  ),
}
