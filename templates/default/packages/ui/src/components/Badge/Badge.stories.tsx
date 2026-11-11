import type { Meta, StoryObj } from '@storybook/react'

import { Badge } from '.'

const meta: Meta<typeof Badge> = {
  title: 'Badge',
  component: Badge,
}

export default meta

type Story = StoryObj<typeof Badge>

export const Offer: Story = { args: { label: '7 DAYS FREE' } }

export const Secondary: Story = {
  args: { variant: 'secondary', label: 'Lifetime' },
}
