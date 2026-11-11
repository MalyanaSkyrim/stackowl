import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { View } from 'react-native'

import { toast, Toaster } from '.'
import { Button } from '../Button'
import { Text } from '../Text'

const meta: Meta<typeof Toaster> = {
  title: 'Toast',
  component: Toaster,
}

export default meta

type Story = StoryObj<typeof Toaster>

export const Default: Story = {
  render: () => (
    <View className="h-80 w-full max-w-md gap-2">
      <Toaster />
      <View className="mt-auto gap-2">
        <Button
          variant="outline"
          onPress={() => toast('Booking saved as draft')}>
          <Text>Default</Text>
        </Button>
        <Button
          variant="outline"
          onPress={() =>
            toast.success('Booking confirmed', {
              description: 'Pick-up Fri 12 Oct, 10:00',
            })
          }>
          <Text>Success</Text>
        </Button>
        <Button
          variant="outline"
          onPress={() =>
            toast.error('Payment failed', { description: 'Try another card.' })
          }>
          <Text>Error</Text>
        </Button>
      </View>
    </View>
  ),
}
