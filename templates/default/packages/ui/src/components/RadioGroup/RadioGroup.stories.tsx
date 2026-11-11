import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { View } from 'react-native'

import { RadioGroup, RadioGroupItem } from '.'
import { Label } from '../Label'

const meta: Meta<typeof RadioGroup> = {
  title: 'RadioGroup',
  component: RadioGroup,
}

export default meta

type Story = StoryObj<typeof RadioGroup>

const OPTIONS = [
  { value: 'basic', label: 'Basic protection' },
  { value: 'standard', label: 'Standard protection' },
  { value: 'full', label: 'Full protection' },
]

export const Default: Story = {
  render: function Render() {
    const [value, setValue] = React.useState('standard')
    return (
      <RadioGroup value={value} onValueChange={setValue}>
        {OPTIONS.map((option) => (
          <View key={option.value} className="flex-row items-center gap-3">
            <RadioGroupItem
              value={option.value}
              aria-labelledby={option.value}
            />
            <Label
              nativeID={option.value}
              onPress={() => setValue(option.value)}>
              {option.label}
            </Label>
          </View>
        ))}
      </RadioGroup>
    )
  },
}
