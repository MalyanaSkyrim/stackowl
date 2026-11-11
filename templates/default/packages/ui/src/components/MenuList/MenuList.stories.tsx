import type { Meta, StoryObj } from '@storybook/react'
import { Globe, HelpCircle, User } from 'lucide-react-native'
import * as React from 'react'
import { View } from 'react-native'

import { MenuList } from '.'
import { Icon } from '../Icon'

const meta: Meta<typeof MenuList> = {
  title: 'MenuList',
  component: MenuList,
}

export default meta

type Story = StoryObj<typeof MenuList>

export const Profile: Story = {
  render: () => (
    <View className="w-80">
      <MenuList
        items={[
          {
            icon: <Icon as={User} size={20} />,
            title: 'Personal data',
            onPress: () => {},
          },
          {
            icon: <Icon as={Globe} size={20} />,
            title: 'Language',
            value: 'English',
            onPress: () => {},
          },
          {
            icon: <Icon as={HelpCircle} size={20} />,
            title: 'Help center',
            onPress: () => {},
          },
        ]}
      />
    </View>
  ),
}

/** A title too long for the row truncates before the value. */
export const LongTitle: Story = {
  render: () => (
    <View className="w-80">
      <MenuList
        items={[
          {
            icon: <Icon as={User} size={20} />,
            title: 'a.very.long.email.address@example.com',
            value: 'Signed in',
            showChevron: false,
          },
        ]}
      />
    </View>
  ),
}

/** A row with a second line, like the signed-out account row in Settings. */
export const WithDescription: Story = {
  render: () => (
    <View className="w-80">
      <MenuList
        items={[
          {
            title: 'Sign in to save your progress',
            description: 'Keep your notes if you change phone',
            onPress: () => {},
          },
        ]}
      />
    </View>
  ),
}
