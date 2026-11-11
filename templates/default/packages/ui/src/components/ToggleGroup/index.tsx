'use client'

import * as ToggleGroupPrimitive from '@rn-primitives/toggle-group'
import { cva, type VariantProps } from 'class-variance-authority'
import { Check } from 'lucide-react-native'
import * as React from 'react'
import {
  Animated,
  Easing,
  I18nManager,
  Platform,
  View,
  type LayoutChangeEvent,
} from 'react-native'

import { cn } from '../../lib/utils'
import { Icon } from '../Icon'
import { TextClassContext } from '../Text'

const toggleGroupVariants = cva('flex flex-row', {
  variants: {
    variant: {
      default: 'items-center gap-1',
      outline: 'items-center gap-0',
      // Pill chips, e.g. a filter above a list.
      chip: 'items-center gap-2',
      // Equal tiles, e.g. a duration picker.
      tile: 'items-center gap-2.5',
      // Selectable cards, e.g. the goal picker.
      card: 'flex-col items-stretch gap-3',
      // Two or three equal segments, e.g. "Sign in | Create account".
      segmented:
        'rounded-input border-border bg-card items-center gap-1 border p-1',
    },
  },
  defaultVariants: { variant: 'default' },
})

const toggleGroupItemVariants = cva(
  cn(
    'group flex flex-row items-center justify-center gap-2',
    Platform.select({
      web: 'focus-visible:border-ring focus-visible:ring-ring/50 cursor-default outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:pointer-events-none',
    }),
  ),
  {
    variants: {
      variant: {
        default: 'active:bg-muted rounded-input h-10 min-w-10 px-3',
        outline:
          'border-input active:bg-muted -ml-px h-10 min-w-10 border px-3 first:ml-0',
        chip: 'border-input bg-card h-10 flex-1 rounded-full border px-3',
        tile: 'border-input bg-card rounded-input h-12 flex-1 border px-3',
        card: 'border-input bg-card rounded-card min-h-14 items-center justify-start gap-3.5 border p-[18px]',
        segmented: 'rounded-segment h-10 flex-1 px-3',
      },
      active: { true: '', false: '' },
    },
    compoundVariants: [
      { variant: 'default', active: true, class: 'bg-secondary' },
      { variant: 'outline', active: true, class: 'bg-secondary' },
      { variant: 'chip', active: true, class: 'bg-primary border-primary' },
      { variant: 'tile', active: true, class: 'bg-primary border-primary' },
      // The thicker border takes 1px of the padding, so the content doesn't move.
      {
        variant: 'card',
        active: true,
        class: 'border-primary border-2 p-[17px]',
      },
    ],
    defaultVariants: { variant: 'default', active: false },
  },
)

type ToggleGroupVariant = NonNullable<
  VariantProps<typeof toggleGroupVariants>['variant']
>

const ToggleGroupContext = React.createContext<{
  variant: ToggleGroupVariant
  /** `segmented` only: the sliding indicator draws the selection. */
  indicatorReady: boolean
}>({ variant: 'default', indicatorReady: false })

/** `segmented` geometry, matching its classes: `border`, `p-1`, `gap-1`. */
const SEGMENT_BORDER = 1
const SEGMENT_PADDING = 4
const SEGMENT_GAP = 4

/** Transforms don't flip in Arabic, so the indicator slides toward the start there. */
const SLIDE_DIRECTION = I18nManager.isRTL ? -1 : 1

/** The values of the items, in order, to find which segment is selected. */
function itemValues(children: React.ReactNode) {
  return React.Children.toArray(children).flatMap((child) =>
    React.isValidElement<{ value: string }>(child) ? [child.props.value] : [],
  )
}

/**
 * The selected segment's primary pill. It slides between equal segments with
 * React Native's `Animated`, so it moves the same on the phone and on the web.
 */
function SegmentIndicator({
  index,
  count,
  width,
}: {
  index: number
  count: number
  width: number
}) {
  const itemWidth =
    (width -
      2 * SEGMENT_BORDER -
      2 * SEGMENT_PADDING -
      SEGMENT_GAP * (count - 1)) /
    count
  const offset = index * (itemWidth + SEGMENT_GAP) * SLIDE_DIRECTION
  const translateX = React.useRef(new Animated.Value(offset))

  React.useEffect(() => {
    Animated.timing(translateX.current, {
      toValue: offset,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start()
  }, [offset])

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: SEGMENT_PADDING,
        bottom: SEGMENT_PADDING,
        start: SEGMENT_PADDING,
        width: itemWidth,
        transform: [{ translateX: translateX.current }],
      }}>
      <View className="rounded-segment bg-primary flex-1" />
    </Animated.View>
  )
}

function ToggleGroup({
  className,
  variant = 'default',
  children,
  ...props
}: ToggleGroupPrimitive.RootProps & { variant?: ToggleGroupVariant }) {
  const [width, setWidth] = React.useState(0)
  const values = itemValues(children)
  const selectedIndex =
    typeof props.value === 'string' ? values.indexOf(props.value) : -1
  const indicatorReady =
    variant === 'segmented' && width > 0 && selectedIndex >= 0

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width)
    props.onLayout?.(event)
  }

  return (
    <ToggleGroupPrimitive.Root
      className={cn(toggleGroupVariants({ variant }), className)}
      {...props}
      onLayout={variant === 'segmented' ? handleLayout : props.onLayout}>
      {indicatorReady && (
        <SegmentIndicator
          index={selectedIndex}
          count={values.length}
          width={width}
        />
      )}
      <ToggleGroupContext.Provider value={{ variant, indicatorReady }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

/**
 * The end of a selectable card: an primary check once picked, and the same empty space before,
 * so the row keeps its size. It sits at the end of the row (the right, or the left in Arabic).
 */
function CardCheck({ active }: { active: boolean }) {
  return (
    <View className="ms-auto size-6 shrink-0 items-center justify-center">
      {active && (
        <Icon as={Check} size={22} strokeWidth={2.6} className="text-primary" />
      )}
    </View>
  )
}

function ToggleGroupItem({
  className,
  children,
  ...props
}: ToggleGroupPrimitive.ItemProps) {
  const { variant, indicatorReady } = React.useContext(ToggleGroupContext)
  const { value } = ToggleGroupPrimitive.useRootContext()
  const active = ToggleGroupPrimitive.utils.getIsSelected(value, props.value)
  const check = variant === 'card' ? <CardCheck active={active} /> : null
  return (
    <TextClassContext.Provider
      value={cn(
        'text-body-sm text-foreground',
        (variant === 'chip' || variant === 'tile' || variant === 'segmented') &&
          active &&
          'text-primary-foreground font-semibold',
        variant === 'tile' && 'text-body-md font-semibold',
        (variant === 'default' || variant === 'outline') &&
          active &&
          'text-primary font-medium',
        variant === 'card' && 'text-body-md',
      )}>
      <ToggleGroupPrimitive.Item
        className={cn(
          toggleGroupItemVariants({ variant, active }),
          // Until the indicator is measured, the selected segment paints itself.
          variant === 'segmented' && active && !indicatorReady && 'bg-primary',
          props.disabled && 'opacity-50',
          className,
        )}
        {...props}>
        {/* Children may be a Pressable render function of the press state. */}
        {typeof children === 'function' ? (
          (state) => (
            <>
              {children(state)}
              {check}
            </>
          )
        ) : (
          <>
            {children}
            {check}
          </>
        )}
      </ToggleGroupPrimitive.Item>
    </TextClassContext.Provider>
  )
}

export {
  ToggleGroup,
  ToggleGroupItem,
  toggleGroupItemVariants,
  toggleGroupVariants,
}
