import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { View } from 'react-native'

import { BarChart } from '.'

const meta: Meta<typeof BarChart> = {
  title: 'BarChart',
  component: BarChart,
}

export default meta

type Story = StoryObj<typeof BarChart>

const WEEK = [12, 18, 9, 21, 16, 0, 14]
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export const Week: Story = {
  render: () => (
    <View className="bg-card border-border rounded-card w-full max-w-sm border p-4">
      <BarChart
        accessibilityLabel="Pages read each day this week"
        highlight={3}
        bars={WEEK.map((value, index) => ({
          key: String(index),
          value,
          label: DAYS[index],
        }))}
      />
    </View>
  ),
}

export const Month: Story = {
  render: () => (
    <View className="bg-card border-border rounded-card w-full max-w-sm border p-4">
      <BarChart
        accessibilityLabel="Pages read each day this month"
        highlight={17}
        bars={Array.from({ length: 31 }, (_, index) => ({
          key: String(index),
          value: index % 5 === 0 ? 0 : ((index * 7) % 11) + 1,
          label: index % 7 === 0 ? String(index + 1) : undefined,
        }))}
      />
    </View>
  ),
}

export const Empty: Story = {
  render: () => (
    <View className="bg-card border-border rounded-card w-full max-w-sm border p-4">
      <BarChart
        accessibilityLabel="Nothing read yet"
        bars={DAYS.map((label, index) => ({
          key: String(index),
          value: 0,
          label,
        }))}
      />
    </View>
  ),
}
