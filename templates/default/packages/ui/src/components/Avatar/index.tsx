'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { View } from 'react-native'

import { cn } from '../../lib/utils'
import { Text } from '../Text'

const avatarVariants = cva('bg-hero items-center justify-center rounded-full', {
  variants: {
    size: {
      md: 'size-10',
      lg: 'size-[52px]',
    },
  },
  defaultVariants: { size: 'md' },
})

const letterSize = { md: 'text-body-md', lg: 'text-title-md' } as const

type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>['size']>

type AvatarProps = {
  /** A name or an email: the circle shows its first letter. */
  name: string
  size?: AvatarSize
  className?: string
}

/** A round primary badge with the first letter of the account's name or email. */
function Avatar({ name, size = 'md', className }: AvatarProps) {
  const letter = name.trim().charAt(0).toLocaleUpperCase()
  return (
    <View
      className={cn(avatarVariants({ size }), className)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Text
        className={cn('text-hero-foreground font-semibold', letterSize[size])}>
        {letter}
      </Text>
    </View>
  )
}

export { Avatar }
export type { AvatarProps, AvatarSize }
