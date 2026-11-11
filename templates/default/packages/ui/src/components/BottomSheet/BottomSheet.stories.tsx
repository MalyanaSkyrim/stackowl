import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { View } from 'react-native'

import { BottomSheet } from '.'
import { Button } from '../Button'
import { Text } from '../Text'

const meta: Meta<typeof BottomSheet> = {
  title: 'BottomSheet',
  component: BottomSheet,
}

export default meta

type Story = StoryObj<typeof BottomSheet>

export const Default: Story = {
  render: function Render() {
    const [open, setOpen] = React.useState(false)
    return (
      <View>
        <Button onPress={() => setOpen(true)}>
          <Text>Open filters</Text>
        </Button>
        <BottomSheet
          open={open}
          onOpenChange={setOpen}
          snapPoints={['45%']}
          footer={
            <Button onPress={() => setOpen(false)}>
              <Text>Show 42 cars</Text>
            </Button>
          }>
          <View className="gap-2">
            <Text variant="h4">Filters</Text>
            <Text variant="muted">Gearbox, price and car type.</Text>
          </View>
        </BottomSheet>
      </View>
    )
  },
}

/** No backdrop: the sheet peeks over the page, which stays scrollable and tappable. */
export const Peek: Story = {
  render: function Render() {
    const [open, setOpen] = React.useState(false)
    const [taps, setTaps] = React.useState(0)
    return (
      <View className="gap-3">
        <Button onPress={() => setOpen(true)}>
          <Text>Open the peek sheet</Text>
        </Button>
        <Button variant="outline" onPress={() => setTaps((count) => count + 1)}>
          <Text>Still tappable ({taps})</Text>
        </Button>
        <BottomSheet
          open={open}
          onOpenChange={setOpen}
          backdrop={false}
          snapPoints={['33%', '75%']}
          scrollable>
          <View className="gap-2">
            <Text variant="h4">Peek sheet</Text>
            <Text variant="muted">
              Drag it up to read more, down to close it.
            </Text>
          </View>
        </BottomSheet>
      </View>
    )
  },
}

/** A fixed header over a long list: only the list scrolls, and its group headers stay pinned. */
export const WithHeader: Story = {
  render: function Render() {
    const [open, setOpen] = React.useState(false)
    const groups = [1, 2, 3]
    return (
      <View>
        <Button onPress={() => setOpen(true)}>
          <Text>Open the list</Text>
        </Button>
        <BottomSheet
          open={open}
          onOpenChange={setOpen}
          snapPoints={['80%']}
          className="pb-10"
          stickyHeaderIndices={groups.map((_, index) => index * 2)}
          header={
            <View className="border-border gap-1 border-b px-5 pb-3">
              <Text variant="h3">Notes</Text>
              <Text variant="muted">The header never scrolls.</Text>
            </View>
          }>
          {groups.flatMap((group) => [
            <View key={`header-${group}`} className="bg-background px-5 py-2">
              <Text variant="kicker">Group {group}</Text>
            </View>,
            <View key={`rows-${group}`} className="gap-6 px-5 py-4">
              {Array.from({ length: 8 }, (_, row) => (
                <Text key={row}>Row {row + 1}</Text>
              ))}
            </View>,
          ])}
        </BottomSheet>
      </View>
    )
  },
}
