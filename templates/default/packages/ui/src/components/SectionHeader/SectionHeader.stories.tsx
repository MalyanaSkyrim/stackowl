import type { Meta, StoryObj } from '@storybook/react'

import { SectionHeader } from '.'

const meta: Meta<typeof SectionHeader> = {
  title: 'SectionHeader',
  component: SectionHeader,
  args: { title: 'This week', detail: '4 notes' },
}

export default meta

type Story = StoryObj<typeof SectionHeader>

export const Default: Story = {}

export const Arabic: Story = {
  args: { title: 'الجزء ٢', detail: 'من الصفحة ٢٢' },
}
