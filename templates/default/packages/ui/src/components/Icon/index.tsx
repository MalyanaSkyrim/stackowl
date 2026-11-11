'use client'

import type { LucideIcon, LucideProps } from 'lucide-react-native'
import { cssInterop } from 'nativewind'
import * as React from 'react'

import { cn } from '../../lib/utils'
import { TextClassContext } from '../Text'

type IconProps = LucideProps & {
  /** The lucide-react-native icon to render, e.g. `as={Search}`. */
  as: LucideIcon
}

function IconImpl({ as: IconComponent, ...props }: IconProps) {
  return <IconComponent {...props} />
}

// Lets `className` set the icon's size and color (`size-5 text-primary`).
cssInterop(IconImpl, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      height: 'size',
      width: 'size',
    },
  },
})

/**
 * Universal icon: any lucide-react-native icon, styled with classes. Inside a
 * Button (or anything providing `TextClassContext`) it takes the text color.
 */
function Icon({
  as: IconComponent,
  className,
  size = 16,
  ...props
}: IconProps) {
  const textClass = React.useContext(TextClassContext)
  return (
    <IconImpl
      as={IconComponent}
      className={cn('text-foreground', textClass, className)}
      size={size}
      // On iOS a drawn SVG shape takes the touch itself, so a tap on the icon's
      // lines would never reach the button around it (the web side is the
      // Button's `[&_svg]:pointer-events-none`).
      pointerEvents="none"
      {...props}
    />
  )
}

export { Icon }
export type { IconProps }
