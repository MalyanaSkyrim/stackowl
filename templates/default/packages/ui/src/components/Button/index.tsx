'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { ActivityIndicator, Platform, Pressable } from 'react-native'

import { cn } from '../../lib/utils'
import { TextClassContext } from '../Text'

const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-2',
    Platform.select({
      web: "focus-visible:ring-ring focus-visible:ring-offset-background whitespace-nowrap outline-none transition-all focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
    }),
  ),
  {
    variants: {
      variant: {
        default: cn(
          // `hero`, not `primary`: the same primary in light mode, a deep one in dark mode,
          // where the bright primary glows as a fill.
          'bg-hero active:bg-hero-hover',
          Platform.select({ web: 'hover:bg-hero-hover' }),
        ),
        // Highlights: "Go Pro".
        gold: cn(
          'bg-gold active:opacity-90',
          Platform.select({ web: 'hover:opacity-90' }),
        ),
        destructive: cn(
          'bg-destructive active:opacity-90',
          Platform.select({
            web: 'focus-visible:ring-destructive/30 hover:opacity-90',
          }),
        ),
        // White card button: "Sign out".
        outline: cn(
          'border-border bg-card active:bg-muted border',
          Platform.select({ web: 'hover:bg-muted' }),
        ),
        // Primary outline: "Sync now".
        secondary: cn(
          'border-primary active:bg-secondary border bg-transparent',
          Platform.select({ web: 'hover:bg-secondary' }),
        ),
        ghost: cn(
          'active:bg-secondary',
          Platform.select({ web: 'hover:bg-secondary' }),
        ),
        link: 'h-auto px-0',
      },
      // From the design canvas: 56px for the main call to action at the
      // bottom of a screen, 48px elsewhere, 36px pills, 44px icon buttons.
      size: {
        default: 'rounded-input h-12 px-4',
        sm: 'h-9 gap-1.5 rounded-full px-3',
        lg: 'rounded-btn h-14 px-6',
        icon: 'h-11 w-11 rounded-full',
      },
    },
    compoundVariants: [{ variant: 'link', class: 'h-auto px-0' }],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const buttonTextVariants = cva(
  cn(
    'text-foreground font-semibold',
    Platform.select({ web: 'pointer-events-none transition-colors' }),
  ),
  {
    variants: {
      variant: {
        default: 'text-hero-foreground',
        gold: 'text-gold-foreground',
        destructive: 'text-destructive-foreground',
        outline: 'text-foreground',
        secondary: 'text-primary',
        ghost: 'text-primary',
        link: cn(
          'text-primary group-active:underline',
          Platform.select({
            web: 'underline-offset-4 hover:underline group-hover:underline',
          }),
        ),
      },
      size: {
        default: 'text-label-sm',
        sm: 'text-body-sm',
        lg: 'text-label',
        icon: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

/** Spinner color per variant, matching the text color. */
const spinnerVariants = cva('', {
  variants: {
    variant: {
      default: 'text-hero-foreground',
      gold: 'text-gold-foreground',
      destructive: 'text-destructive-foreground',
      outline: 'text-foreground',
      secondary: 'text-primary',
      ghost: 'text-primary',
      link: 'text-primary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

type ButtonVariant = VariantProps<typeof buttonVariants>['variant']

/** Filled buttons look like a neutral tile when disabled. */
const isFilled = (variant: ButtonVariant) =>
  variant === undefined ||
  variant === null ||
  variant === 'default' ||
  variant === 'gold' ||
  variant === 'destructive'

type ButtonProps = React.ComponentProps<typeof Pressable> &
  VariantProps<typeof buttonVariants> & {
    /** Shows a spinner before the content and disables the button. */
    loading?: boolean
  }

/**
 * Universal button (react-native-reusables, styled to the Starter App canvas).
 * Renders a `Pressable` on native and, through react-native-web, a DOM element
 * on the web. Put a `Text` (and an icon, if any) inside it; the variant's text
 * classes reach the `Text` through `TextClassContext`.
 */
function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled) || loading
  return (
    <TextClassContext.Provider
      value={cn(
        buttonTextVariants({ variant, size }),
        isDisabled && isFilled(variant) && !loading && 'text-muted-foreground',
      )}>
      <Pressable
        className={cn(
          buttonVariants({ variant, size }),
          isDisabled &&
            (isFilled(variant) && !loading
              ? 'bg-input border-transparent'
              : 'opacity-50'),
          className,
        )}
        role="button"
        disabled={isDisabled}
        aria-busy={loading}
        {...props}>
        {(state) => (
          <>
            {loading && (
              <ActivityIndicator
                size="small"
                className={spinnerVariants({ variant })}
              />
            )}
            {typeof children === 'function' ? children(state) : children}
          </>
        )}
      </Pressable>
    </TextClassContext.Provider>
  )
}

export { Button, buttonTextVariants, buttonVariants }
export type { ButtonProps }
