import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { View } from 'react-native'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '.'
import { Text } from '../Text'

const meta: Meta<typeof Accordion> = {
  title: 'Accordion',
  component: Accordion,
}

export default meta

type Story = StoryObj<typeof Accordion>

const FAQ = [
  {
    q: 'What do I need to pick up the car?',
    a: 'Your driving licence, an ID or passport and a credit card in the driver’s name.',
  },
  { q: 'Can I cancel for free?', a: 'Yes, up to 48 hours before pick-up.' },
  {
    q: 'Is there a mileage limit?',
    a: 'No, every rental includes unlimited kilometres.',
  },
]

export const Single: Story = {
  render: () => (
    <View className="w-[520px] max-w-full">
      <Accordion type="single" collapsible defaultValue="item-0">
        {FAQ.map((item, index) => (
          <AccordionItem key={item.q} value={`item-${index}`}>
            <AccordionTrigger>
              <Text className="text-base font-semibold">{item.q}</Text>
            </AccordionTrigger>
            <AccordionContent>
              <Text className="text-muted-foreground">{item.a}</Text>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </View>
  ),
}
