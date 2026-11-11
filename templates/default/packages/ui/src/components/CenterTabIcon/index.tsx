'use client'

import type { LucideIcon } from 'lucide-react-native'
import * as React from 'react'
import { Animated, Pressable, View } from 'react-native'
import type { PressableProps } from 'react-native'

import { cn } from '../../lib/utils'
import { Icon } from '../Icon'

/** Whether the tab around the circle is pressed, set by `CenterTabPressable`. */
const CenterTabPressedContext = React.createContext(false)

type CenterTabIconProps = {
  icon: LucideIcon
  className?: string
}

/**
 * The bottom bar's main action, in the middle of the tabs: a gold circle with no border, snug
 * around its icon. Given as a tab's icon, its layout box is the other icons' box, so the tab's own
 * label stays level with theirs, and the circle rises out of the bar above it. While the tab is
 * pressed (inside `CenterTabPressable`) it shrinks a little and dims, then springs back.
 */
function CenterTabIcon({ icon, className }: CenterTabIconProps) {
  const pressed = React.useContext(CenterTabPressedContext)
  const press = React.useRef(new Animated.Value(0))

  React.useEffect(() => {
    Animated.spring(press.current, {
      toValue: pressed ? 1 : 0,
      speed: 40,
      bounciness: pressed ? 0 : 8,
      useNativeDriver: true,
    }).start()
  }, [pressed])

  return (
    <View
      pointerEvents="none"
      className={cn(
        'flex-1 items-center justify-end overflow-visible',
        className,
      )}>
      <Animated.View
        className="bg-gold shadow-elevation-3 h-[42px] w-[42px] items-center justify-center rounded-full border-0"
        style={{
          transform: [
            {
              scale: press.current.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.92],
              }),
            },
          ],
          opacity: press.current.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.85],
          }),
        }}>
        <Icon
          as={icon}
          size={26}
          className="text-gold-foreground"
          fill="currentColor"
        />
      </Animated.View>
    </View>
  )
}

type CenterTabPressableProps = Omit<PressableProps, 'children'> & {
  children: React.ReactNode
}

/** The center tab's button: a Pressable that tells the `CenterTabIcon` inside when it is pressed. */
function CenterTabPressable({ children, ...props }: CenterTabPressableProps) {
  return (
    <Pressable role="button" {...props}>
      {({ pressed }) => (
        <CenterTabPressedContext.Provider value={pressed}>
          {children}
        </CenterTabPressedContext.Provider>
      )}
    </Pressable>
  )
}

export { CenterTabIcon, CenterTabPressable }
export type { CenterTabIconProps, CenterTabPressableProps }
