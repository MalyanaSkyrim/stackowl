import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { View } from 'react-native'

import { ToggleGroup, ToggleGroupItem } from '.'
import { Text } from '../Text'

const meta: Meta<typeof ToggleGroup> = {
  title: 'ToggleGroup',
  component: ToggleGroup,
}

export default meta

type Story = StoryObj<typeof ToggleGroup>

/** A filter above a list. */
export const Chips: Story = {
  render: function Render() {
    const [value, setValue] = React.useState<string | undefined>('all')
    return (
      <View className="w-96">
        <ToggleGroup
          type="single"
          variant="chip"
          value={value}
          onValueChange={setValue}>
          {['All', 'Recent', 'Starred', 'Shared'].map((label) => (
            <ToggleGroupItem
              key={label}
              value={label.toLowerCase()}
              aria-label={label}>
              <Text>{label}</Text>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </View>
    )
  },
}

/** "Sign in | Create account" on the auth sheet. The selection slides. */
export const Segmented: Story = {
  render: function Render() {
    const [value, setValue] = React.useState<string | undefined>('signIn')
    return (
      <View className="w-96">
        <ToggleGroup
          type="single"
          variant="segmented"
          value={value}
          onValueChange={(next) => {
            if (next) setValue(next)
          }}>
          <ToggleGroupItem value="signIn" aria-label="Sign in">
            <Text>Sign in</Text>
          </ToggleGroupItem>
          <ToggleGroupItem value="signUp" aria-label="Create account">
            <Text>Create account</Text>
          </ToggleGroupItem>
        </ToggleGroup>
      </View>
    )
  },
}

/** A duration picker. */
export const Tiles: Story = {
  render: function Render() {
    const [value, setValue] = React.useState<string | undefined>('15')
    return (
      <View className="w-96">
        <ToggleGroup
          type="single"
          variant="tile"
          value={value}
          onValueChange={setValue}>
          {['5', '15', '30'].map((minutes) => (
            <ToggleGroupItem
              key={minutes}
              value={minutes}
              aria-label={`${minutes} minutes`}>
              <Text>{minutes} min</Text>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </View>
    )
  },
}

/** Selectable cards, e.g. the goal picker in onboarding. */
export const Cards: Story = {
  render: function Render() {
    const [value, setValue] = React.useState<string | undefined>('solo')
    return (
      <View className="w-96">
        <ToggleGroup
          type="single"
          variant="card"
          value={value}
          onValueChange={setValue}>
          {[
            {
              value: 'solo',
              title: 'Just me',
              sub: 'Keep notes for yourself',
            },
            {
              value: 'team',
              title: 'With a team',
              sub: 'Share notes with the people you work with',
            },
          ].map((goal) => (
            <ToggleGroupItem
              key={goal.value}
              value={goal.value}
              aria-label={goal.title}>
              <View className="flex-1 gap-1">
                <Text className="font-semibold">{goal.title}</Text>
                <Text variant="muted">{goal.sub}</Text>
              </View>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </View>
    )
  },
}

export const Outline: Story = {
  render: function Render() {
    const [value, setValue] = React.useState<string | undefined>('day')
    return (
      <ToggleGroup
        type="single"
        variant="outline"
        value={value}
        onValueChange={setValue}>
        <ToggleGroupItem value="day" aria-label="Day" className="rounded-l-lg">
          <Text>Day</Text>
        </ToggleGroupItem>
        <ToggleGroupItem value="week" aria-label="Week">
          <Text>Week</Text>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="month"
          aria-label="Month"
          className="rounded-r-lg">
          <Text>Month</Text>
        </ToggleGroupItem>
      </ToggleGroup>
    )
  },
}
