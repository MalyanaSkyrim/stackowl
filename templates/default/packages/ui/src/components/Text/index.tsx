'use client'

import * as Slot from '@rn-primitives/slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { Platform, Text as RNText, type Role } from 'react-native'

import { cn } from '../../lib/utils'

const textVariants = cva(
  cn(
    'text-foreground text-body-md font-sans',
    Platform.select({ web: 'select-text' }),
  ),
  {
    variants: {
      variant: {
        default: '',
        // Type scale from the design canvas; see `fontSize` in the tokens.
        display: 'text-display font-display',
        h1: 'text-title-lg font-display',
        h2: 'text-title-md font-display',
        h3: 'text-title-sm font-semibold',
        h4: 'text-title-xs font-semibold',
        p: 'text-body-md text-foreground-soft',
        lead: 'text-muted-foreground text-body-md',
        large: 'text-body-lg font-semibold',
        small: 'text-body-sm font-medium',
        muted: 'text-muted-foreground text-body-sm',
        caption: 'text-muted-foreground text-caption',
        kicker: 'text-kicker text-muted-foreground font-semibold uppercase',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type TextVariantProps = VariantProps<typeof textVariants>

type TextVariant = NonNullable<TextVariantProps['variant']>

const ROLE: Partial<Record<TextVariant, Role>> = {
  display: 'heading',
  h1: 'heading',
  h2: 'heading',
  h3: 'heading',
  h4: 'heading',
}

const ARIA_LEVEL: Partial<Record<TextVariant, string>> = {
  display: '1',
  h1: '1',
  h2: '2',
  h3: '3',
  h4: '4',
}

/**
 * Lets a parent (Button, Badge, ...) style the `Text` inside it without the
 * caller repeating the classes.
 */
const TextClassContext = React.createContext<string | undefined>(undefined)

/** The writing system of the UI copy: picks the UI font and the direction. */
type TextScript = 'latin' | 'arabic'

const TextScriptContext = React.createContext<TextScript>('latin')

/**
 * Sets the script for every `Text` inside it. Mount it under the i18n
 * provider with `arabic` when the app language is Arabic, so UI copy switches
 * to IBM Plex Sans Arabic and reads right to left without each screen asking.
 * iOS aligns text by the app bundle's language, not `I18nManager`, so the
 * explicit direction is what puts Arabic copy on the right.
 */
function TextScriptProvider({
  script,
  children,
}: {
  script: TextScript
  children?: React.ReactNode
}) {
  return (
    <TextScriptContext.Provider value={script}>
      {children}
    </TextScriptContext.Provider>
  )
}

type Weight = '' | '-medium' | '-semibold'

const WEIGHT_CLASSES: Record<string, Weight> = {
  'font-normal': '',
  'font-medium': '-medium',
  'font-semibold': '-semibold',
  'font-bold': '-semibold',
}

// Written out in full so Tailwind and NativeWind find every class.
const UI_FONT: Record<TextScript, Record<Weight, string>> = {
  latin: {
    '': 'font-sans',
    '-medium': 'font-sans-medium',
    '-semibold': 'font-sans-semibold',
  },
  arabic: {
    '': 'font-arabic',
    '-medium': 'font-arabic-medium',
    '-semibold': 'font-arabic-semibold',
  },
}

const DISPLAY_FONT: Record<TextScript, string> = {
  latin: 'font-display',
  arabic: 'font-display-ar',
}

// Written out in full so Tailwind and NativeWind find every class. Arabic headlines need
// a taller line at the same size (see `fontSize` in the tokens).
const DISPLAY_AR_SIZE: Record<string, string> = {
  'text-display': 'text-display-ar',
  'text-title-lg': 'text-title-lg-ar',
  'text-title-md': 'text-title-md-ar',
}

const FAMILY_CLASS =
  /^font-(sans|arabic|display|display-ar)(-medium|-semibold)?$/

/**
 * On native every font weight is its own family, and `fontWeight` on a
 * custom family falls back to the system font. So callers keep writing
 * `font-semibold`, and this turns the family and weight classes into the one
 * family class that matches the script: `font-semibold` in Arabic becomes
 * `font-arabic-semibold`. An explicit `font-arabic` is kept.
 * Arabic headlines also swap the size class for their own, with a taller line.
 */
function resolveFontClasses(className: string, script: TextScript): string {
  let family = 'sans'
  let weight: Weight = ''
  const rest: string[] = []
  for (const name of className.split(/\s+/)) {
    if (!name) continue
    const weightClass = WEIGHT_CLASSES[name]
    if (weightClass !== undefined) {
      weight = weightClass
      continue
    }
    const match = FAMILY_CLASS.exec(name)
    if (match?.[1]) {
      family = match[1]
      if (match[2] === '-medium' || match[2] === '-semibold') weight = match[2]
      continue
    }
    rest.push(name)
  }
  const fontClass =
    family === 'display-ar'
      ? 'font-display-ar'
      : family === 'display'
        ? DISPLAY_FONT[script]
        : UI_FONT[family === 'arabic' ? 'arabic' : script][weight]
  const sizes =
    fontClass === 'font-display-ar'
      ? rest.map((name) => DISPLAY_AR_SIZE[name] ?? name)
      : rest
  return [...sizes, fontClass].join(' ')
}

/**
 * `resolveFontClasses` with the script from `TextScriptProvider`, for
 * primitives that render their own text (labels, dialog titles).
 */
function useFontClasses(className: string): string {
  return resolveFontClasses(className, React.useContext(TextScriptContext))
}

type TextProps = React.ComponentProps<typeof RNText> &
  TextVariantProps & {
    asChild?: boolean
    /**
     * Overrides the script from `TextScriptProvider`, e.g. an Arabic name
     * inside English copy. Arabic text is also marked right to left.
     */
    script?: TextScript
  }

function Text({
  className,
  asChild = false,
  variant = 'default',
  script: scriptProp,
  style,
  ...props
}: TextProps) {
  const textClass = React.useContext(TextClassContext)
  const contextScript = React.useContext(TextScriptContext)
  const script = scriptProp ?? contextScript
  const Component = asChild ? Slot.Text : RNText
  return (
    <Component
      className={resolveFontClasses(
        cn(textVariants({ variant }), textClass, className),
        script,
      )}
      role={variant ? ROLE[variant] : undefined}
      aria-level={variant ? ARIA_LEVEL[variant] : undefined}
      style={script === 'arabic' ? [{ writingDirection: 'rtl' }, style] : style}
      {...props}
    />
  )
}

export {
  resolveFontClasses,
  Text,
  TextClassContext,
  TextScriptContext,
  TextScriptProvider,
  textVariants,
  useFontClasses,
}
export type { TextProps, TextScript }
