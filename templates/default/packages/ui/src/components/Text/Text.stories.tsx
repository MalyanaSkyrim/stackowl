import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { View } from 'react-native'

import { Text, TextScriptProvider } from '.'

const meta: Meta<typeof Text> = {
  title: 'Text',
  component: Text,
}

export default meta

type Story = StoryObj<typeof Text>

export const Variants: Story = {
  render: () => (
    <View className="gap-3">
      <Text variant="display">Pick a goal</Text>
      <Text variant="kicker">Section title</Text>
      <Text variant="h1">Heading 1</Text>
      <Text variant="h2">Heading 2</Text>
      <Text variant="h3">Heading 3</Text>
      <Text variant="h4">Heading 4</Text>
      <Text variant="lead">A lead paragraph that introduces a section.</Text>
      <Text>Body text in the default size.</Text>
      <Text variant="large">Large text</Text>
      <Text variant="small">Small text</Text>
      <Text variant="muted">Muted text for secondary information.</Text>
    </View>
  ),
}

/** Under `TextScriptProvider script="arabic"` the same variants use the Arabic fonts. */
export const Arabic: Story = {
  render: () => (
    <TextScriptProvider script="arabic">
      <View className="gap-3">
        <Text variant="h1">ما هدفك الأهم؟</Text>
        <Text className="font-semibold">اختر التطبيقات التي تريد قفلها</Text>
        <Text variant="muted">يمكنك تغيير ذلك لاحقًا.</Text>
      </View>
    </TextScriptProvider>
  ),
}
