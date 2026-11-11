import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '.'
import { Button } from '../Button'
import { Text } from '../Text'

const meta: Meta<typeof Card> = {
  title: 'Card',
  component: Card,
}

export default meta

type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Toyota Corolla</CardTitle>
        <CardDescription>or similar · Compact</CardDescription>
      </CardHeader>
      <CardContent>
        <Text>5 seats · Automatic · Petrol</Text>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" className="flex-1">
          <Text>Details</Text>
        </Button>
        <Button className="flex-1">
          <Text>Book</Text>
        </Button>
      </CardFooter>
    </Card>
  ),
}
