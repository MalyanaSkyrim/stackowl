import type { Meta, StoryObj } from '@storybook/react'
import { BookOpen } from 'lucide-react-native'
import * as React from 'react'
import { View } from 'react-native'

import { CenterTabIcon, CenterTabPressable } from '.'
import { Text } from '../Text'

const meta: Meta<typeof CenterTabIcon> = {
  title: 'CenterTabIcon',
  component: CenterTabIcon,
  args: { icon: BookOpen },
}

export default meta

type Story = StoryObj<typeof CenterTabIcon>

/** In the middle of a tab bar: it rises out of the bar, its label level with the others. Press it. */
export const InATabBar: Story = {
  render: (args) => (
    <View className="bg-card border-border mt-10 h-[88px] w-full max-w-sm flex-row items-start border-t px-1 pt-2">
      {['Home', 'Search', 'New', 'Inbox', 'Settings'].map((label) => {
        const tab = (
          <>
            <View className="h-[28px] w-[31px]">
              {label === 'New' ? <CenterTabIcon {...args} /> : null}
            </View>
            <Text className="text-tiny text-muted-foreground font-semibold">
              {label}
            </Text>
          </>
        )
        return label === 'New' ? (
          <CenterTabPressable
            key={label}
            className="flex-1 items-center gap-0.5"
            onPress={() => {}}>
            {tab}
          </CenterTabPressable>
        ) : (
          <View key={label} className="flex-1 items-center gap-0.5">
            {tab}
          </View>
        )
      })}
    </View>
  ),
}
