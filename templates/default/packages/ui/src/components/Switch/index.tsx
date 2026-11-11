'use client'

import * as SwitchPrimitives from '@rn-primitives/switch'
import * as React from 'react'
import {
  Animated,
  Easing,
  I18nManager,
  Platform,
  StyleSheet,
} from 'react-native'

import { useTokenColor } from '../../lib/token-colors'
import { cn } from '../../lib/utils'

/** 51px track, 27px thumb, 2px inset on each side: the iOS switch. */
const THUMB_TRAVEL = 20

/** Transforms don't flip in Arabic, so the thumb slides toward the start there. */
const SLIDE_DIRECTION = I18nManager.isRTL ? -1 : 1

/**
 * On/off switch. The thumb slides and the track fades from `input` to
 * `primary` with React Native's `Animated`, so it moves the same on the phone
 * and on the web.
 */
function Switch({ className, ...props }: SwitchPrimitives.RootProps) {
  const tokenColor = useTokenColor()
  const progress = React.useRef(new Animated.Value(props.checked ? 1 : 0))

  React.useEffect(() => {
    // Not the native driver: it can't animate the track color.
    Animated.timing(progress.current, {
      toValue: props.checked ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start()
  }, [props.checked])

  return (
    <SwitchPrimitives.Root
      className={cn(
        'h-[31px] w-[51px] shrink-0 flex-row items-center rounded-full px-0.5',
        Platform.select({
          web: 'focus-visible:ring-ring/50 peer inline-flex outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed',
        }),
        props.disabled && 'opacity-50',
        className,
      )}
      {...props}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.track,
          {
            backgroundColor: progress.current.interpolate({
              inputRange: [0, 1],
              outputRange: [tokenColor('input'), tokenColor('primary')],
            }),
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={{
          transform: [
            {
              translateX: progress.current.interpolate({
                inputRange: [0, 1],
                outputRange: [0, THUMB_TRAVEL * SLIDE_DIRECTION],
              }),
            },
          ],
        }}>
        <SwitchPrimitives.Thumb className="size-[27px] rounded-full bg-white shadow-sm shadow-black/15" />
      </Animated.View>
    </SwitchPrimitives.Root>
  )
}

const styles = StyleSheet.create({
  track: { ...StyleSheet.absoluteFillObject, borderRadius: 9999 },
})

export { Switch }
