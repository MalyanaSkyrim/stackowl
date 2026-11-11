import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { View } from 'react-native'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '.'
import { Button } from '../Button'
import { Input } from '../Input'
import { Label } from '../Label'
import { Text } from '../Text'

const meta: Meta<typeof Dialog> = {
  title: 'Dialog',
  component: Dialog,
}

export default meta

type Story = StoryObj<typeof Dialog>

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Text>Edit driver</Text>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Main driver</DialogTitle>
          <DialogDescription>
            The person who picks up the car.
          </DialogDescription>
        </DialogHeader>
        <View className="gap-3">
          <Label>Full name</Label>
          <Input defaultValue="John Doe" />
        </View>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">
              <Text>Cancel</Text>
            </Button>
          </DialogClose>
          <Button>
            <Text>Save</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

/** Opened from state, as the reset-password confirmation does. */
export const Controlled: Story = {
  render: function Render() {
    const [open, setOpen] = React.useState(true)
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <Button onPress={() => setOpen(true)}>
          <Text>Show confirmation</Text>
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password updated</DialogTitle>
            <DialogDescription>
              Sign in with your new password.
            </DialogDescription>
          </DialogHeader>
          <Button onPress={() => setOpen(false)}>
            <Text>Sign in</Text>
          </Button>
        </DialogContent>
      </Dialog>
    )
  },
}
