import type { Config } from 'tailwindcss'

import {
  boxShadow,
  fontFamily,
  fontSize,
  radius,
  semanticColors,
  spacing,
} from './tokens'

const color = (name: keyof typeof semanticColors.light) =>
  `rgb(var(--${name}) / <alpha-value>)`

/** `primary` → `{ DEFAULT, foreground }`. */
const withForeground = (
  name:
    | 'primary'
    | 'hero'
    | 'secondary'
    | 'muted'
    | 'accent'
    | 'gold'
    | 'destructive'
    | 'success'
    | 'warning'
    | 'info'
    | 'card'
    | 'popover',
) => ({
  DEFAULT: color(name),
  foreground: color(`${name}-foreground`),
})

/**
 * Shared Tailwind 3 preset for web (`packages/ui`, `apps/web`) and native
 * (NativeWind in `apps/mobile` and the Workshop).
 *
 * It maps the shadcn / react-native-reusables color names to the variables
 * from `tokens.ts`, so those components work unchanged. It only touches
 * `extend`.
 *
 * Like any preset without its own `presets`, it brings Tailwind's default
 * theme with it, so list it before `nativewind/preset`, or it would undo
 * NativeWind's overrides (its shadows, for example).
 */
const preset = {
  content: [],
  theme: {
    extend: {
      colors: {
        border: color('border'),
        input: color('input'),
        ring: color('ring'),
        foreground: {
          DEFAULT: color('foreground'),
          soft: color('foreground-soft'),
        },
        background: color('background'),
        primary: {
          ...withForeground('primary'),
          hover: color('primary-hover'),
        },
        // Primary fills (filled buttons, large cards); deeper than primary in dark mode.
        hero: { ...withForeground('hero'), hover: color('hero-hover') },
        secondary: withForeground('secondary'),
        muted: withForeground('muted'),
        accent: withForeground('accent'),
        gold: withForeground('gold'),
        destructive: {
          ...withForeground('destructive'),
          soft: color('destructive-soft'),
        },
        success: withForeground('success'),
        warning: withForeground('warning'),
        info: withForeground('info'),
        card: withForeground('card'),
        popover: withForeground('popover'),
      },
      borderRadius: {
        input: radius.input,
        segment: radius.segment,
        btn: radius.btn,
        card: radius.card,
        'card-lg': radius['card-lg'],
        sheet: radius.sheet,
      },
      spacing,
      fontFamily,
      fontSize,
      boxShadow,
    },
  },
} satisfies Config

export default preset
