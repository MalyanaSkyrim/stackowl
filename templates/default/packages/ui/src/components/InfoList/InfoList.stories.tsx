import type { Meta, StoryObj } from '@storybook/react'
import { BookOpen, Clock, Smartphone } from 'lucide-react-native'
import * as React from 'react'

import { InfoList } from '.'

const meta: Meta<typeof InfoList> = {
  title: 'InfoList',
  component: InfoList,
}

export default meta

type Story = StoryObj<typeof InfoList>

export const Default: Story = {
  render: () => (
    <InfoList
      className="w-full max-w-sm"
      items={[
        {
          icon: Smartphone,
          title: 'Pick your apps',
          description: 'They lock and open together. Calls always work.',
        },
        {
          icon: Clock,
          title: 'Choose your reading time',
          description: 'Until then, your apps are open.',
        },
        {
          icon: BookOpen,
          title: 'Locked until you read',
          description:
            'Everything you write is saved on your phone first.',
        },
      ]}
    />
  ),
}
