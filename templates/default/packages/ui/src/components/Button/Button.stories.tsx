import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { View } from 'react-native'

import { Button, type ButtonProps } from '.'
import { Text } from '../Text'

const meta: Meta<typeof Button> = {
  title: 'Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'gold',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: { control: 'boolean' },
  },
  args: {
    variant: 'default',
    size: 'default',
  },
  render: (args: ButtonProps) => (
    <Button {...args}>
      <Text>Button</Text>
    </Button>
  ),
}

export default meta

type Story = StoryObj<typeof Button>

const VARIANTS: NonNullable<ButtonProps['variant']>[] = [
  'default',
  'gold',
  'secondary',
  'outline',
  'ghost',
  'link',
  'destructive',
]

export const Default: Story = {}

/** The call to action at the bottom of a screen. */
export const Large: Story = { args: { size: 'lg' } }

export const Gold: Story = { args: { variant: 'gold' } }

export const Secondary: Story = { args: { variant: 'secondary' } }

export const Outline: Story = { args: { variant: 'outline' } }

export const Ghost: Story = { args: { variant: 'ghost' } }

export const Link: Story = { args: { variant: 'link' } }

export const Destructive: Story = { args: { variant: 'destructive' } }

export const Disabled: Story = { args: { disabled: true } }

export const AllVariants: Story = {
  render: () => (
    <View className="gap-3">
      {VARIANTS.map((variant) => (
        <Button key={variant} variant={variant}>
          <Text>{variant}</Text>
        </Button>
      ))}
    </View>
  ),
}
