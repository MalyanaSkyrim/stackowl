import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { View } from 'react-native'

import { TimePicker, type TimeOfDay } from '.'
import { Text } from '../Text'

const meta: Meta<typeof TimePicker> = {
  title: 'TimePicker',
  component: TimePicker,
}

export default meta

type Story = StoryObj<typeof TimePicker>

const label = (time: TimeOfDay) =>
  `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`

function TwentyFourHourStory() {
  const [time, setTime] = React.useState<TimeOfDay>({ hour: 21, minute: 0 })
  return (
    <View className="gap-3">
      <TimePicker
        value={time}
        onChange={setTime}
        hourCycle="24"
        minuteInterval={5}
      />
      <Text variant="muted">Picked: {label(time)}</Text>
    </View>
  )
}

function TwelveHourStory() {
  const [time, setTime] = React.useState<TimeOfDay>({ hour: 6, minute: 30 })
  return (
    <View className="gap-3">
      <TimePicker
        value={time}
        onChange={setTime}
        hourCycle="12"
        maximum={{ hour: 23, minute: 30 }}
      />
      <Text variant="muted">Picked: {label(time)} (latest 23:30)</Text>
    </View>
  )
}

export const TwentyFourHour: Story = { render: () => <TwentyFourHourStory /> }

export const TwelveHour: Story = { render: () => <TwelveHourStory /> }
