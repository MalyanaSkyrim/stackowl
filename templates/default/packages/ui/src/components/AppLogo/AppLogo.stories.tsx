import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { View } from 'react-native'

import { AppLogo } from '.'

const meta: Meta<typeof AppLogo> = {
  title: 'AppLogo',
  component: AppLogo,
}

export default meta

type Story = StoryObj<typeof AppLogo>

export const Default: Story = {
  args: { size: 80 },
}

export const OnDark: Story = {
  render: () => (
    <View className="bg-primary items-center justify-center rounded-2xl p-6">
      <AppLogo size={64} color="#FFFFFF" />
    </View>
  ),
}

export const SingleColor: Story = {
  render: () => (
    <View className="bg-primary items-center justify-center rounded-2xl p-6">
      <AppLogo size={64} color="#FFFFFF" accentColor="#FFFFFF" />
    </View>
  ),
}
