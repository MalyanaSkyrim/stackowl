import type { Meta, StoryObj } from '@storybook/react'
import { CalendarClock } from 'lucide-react-native'
import * as React from 'react'
import { View } from 'react-native'

import { Callout } from '.'
import { Button } from '../Button'
import { Text } from '../Text'

const meta: Meta<typeof Callout> = {
  title: 'Callout',
  component: Callout,
}

export default meta

type Story = StoryObj<typeof Callout>

export const Variants: Story = {
  render: () => (
    <View className="w-full max-w-sm gap-3">
      <Callout
        variant="hero"
        title="Backup at 9:00 PM"
        description="Your notes are saved on this phone until then."
      />
      <Callout description="This change applies after the next sign-in." />
      <Callout
        variant="secondary"
        description="You have 3 notes in drafts. Finish one?">
        <Button>
          <Text>Open drafts</Text>
        </Button>
      </Callout>
      <Callout
        variant="accent"
        icon={CalendarClock}
        title="Waiting for tomorrow">
        <Text>• Backup: 11:00 PM</Text>
        <Text>• Sync turns off</Text>
      </Callout>
      <Callout
        variant="card"
        title="Sync is off"
        description="Notes stay on this phone."
      />
    </View>
  ),
}
