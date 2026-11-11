import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { View } from 'react-native'

import { Switch } from '.'
import { Label } from '../Label'

const meta: Meta<typeof Switch> = {
  title: 'Switch',
  component: Switch,
}

export default meta

type Story = StoryObj<typeof Switch>

export const Default: Story = {
  render: function Render() {
    const [checked, setChecked] = React.useState(true)
    return (
      <View className="gap-4">
        <View className="flex-row items-center gap-3">
          <Switch
            checked={checked}
            onCheckedChange={setChecked}
            nativeID="notifications"
          />
          <Label nativeID="notifications">Daily reminder</Label>
        </View>
        <View className="flex-row items-center gap-3">
          <Switch checked={false} onCheckedChange={() => {}} disabled />
          <Label disabled>Disabled</Label>
        </View>
      </View>
    )
  },
}
