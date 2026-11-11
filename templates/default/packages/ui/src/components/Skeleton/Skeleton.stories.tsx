import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { View } from 'react-native'

import { Skeleton } from '.'

const meta: Meta<typeof Skeleton> = {
  title: 'Skeleton',
  component: Skeleton,
}

export default meta

type Story = StoryObj<typeof Skeleton>

export const CarCardLoading: Story = {
  render: () => (
    <View className="w-72 gap-3">
      <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </View>
  ),
}
