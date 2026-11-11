import type { Meta, StoryObj } from '@storybook/react'
import { Bookmark } from 'lucide-react-native'
import * as React from 'react'
import { View } from 'react-native'

import { ShortcutTile } from '.'
import { Icon } from '../Icon'
import { ProgressRing } from '../ProgressRing'

const meta: Meta<typeof ShortcutTile> = {
  title: 'ShortcutTile',
  component: ShortcutTile,
}

export default meta

type Story = StoryObj<typeof ShortcutTile>

export const Pair: Story = {
  render: () => (
    <View className="w-full max-w-sm flex-row gap-2.5">
      <ShortcutTile
        className="flex-1"
        leading={<ProgressRing value={0.42} label="42%" />}
        title="Notes"
        caption="12 notes"
        onPress={() => {}}
      />
      <ShortcutTile
        className="flex-1"
        leading={
          <View className="bg-secondary h-10 w-10 items-center justify-center rounded-xl">
            <Icon
              as={Bookmark}
              size={18}
              className="text-primary"
              fill="currentColor"
            />
          </View>
        }
        title="Bookmarks"
        caption="2 pages · 3 ayat"
        onPress={() => {}}
      />
    </View>
  ),
}
