/**
 * Design tokens: the single source of truth for the web app and the mobile app.
 *
 * Colors are space-separated RGB triplets ("15 76 69") so both platforms can
 * use them as `rgb(var(--name) / <alpha-value>)`, which keeps Tailwind opacity
 * modifiers (`bg-primary/50`) working on web and in NativeWind.
 *
 * After editing this file run `pnpm --filter=@starter/design-tokens generate`
 * to refresh `tokens.css`. The Tailwind preset and the native theme read this
 * file directly.
 *
 */

export type RgbTriplet = `${number} ${number} ${number}`

type ColorSet<TKey extends string> = Record<TKey, RgbTriplet>

/**
 * shadcn / react-native-reusables names, emitted as `--background`, `--primary`, ..., plus
 * a few extras (`hero`, `gold`, `foreground-soft`). The starter uses a neutral palette with
 * an indigo primary: change these to your brand's colors, then run `generate`.
 */
const semanticLight = {
  background: '250 250 250', // #FAFAFA
  foreground: '24 24 27', // zinc-900 #18181B
  'foreground-soft': '63 63 70', // body copy #3F3F46
  card: '255 255 255',
  'card-foreground': '24 24 27',
  popover: '255 255 255',
  'popover-foreground': '24 24 27',
  primary: '79 70 229', // indigo-600 #4F46E5
  'primary-hover': '67 56 202', // indigo-700 #4338CA
  'primary-foreground': '255 255 255',
  // Filled buttons and large surfaces. Same as primary in light mode; in dark mode a deeper
  // shade, because the bright primary glows as a fill.
  hero: '79 70 229',
  'hero-hover': '67 56 202',
  'hero-foreground': '255 255 255',
  // Primary tint: selected rows, success callouts.
  secondary: '238 242 255', // indigo-50 #EEF2FF
  'secondary-foreground': '67 56 202',
  muted: '244 244 245', // zinc-100 #F4F4F5
  'muted-foreground': '113 113 122', // zinc-500 #71717A
  accent: '244 244 245',
  'accent-foreground': '24 24 27',
  // A highlight color for badges and progress. A fill only: too light for text.
  gold: '245 158 11', // amber-500 #F59E0B
  'gold-foreground': '24 24 27',
  destructive: '220 38 38', // red-600 #DC2626
  'destructive-foreground': '255 255 255',
  'destructive-soft': '254 226 226', // red-100 #FEE2E2
  success: '22 163 74', // green-600 #16A34A
  'success-foreground': '255 255 255',
  warning: '217 119 6', // amber-600 #D97706
  'warning-foreground': '255 255 255',
  info: '37 99 235', // blue-600 #2563EB
  'info-foreground': '255 255 255',
  border: '228 228 231', // zinc-200 #E4E4E7
  input: '228 228 231',
  ring: '79 70 229',
} as const satisfies Record<string, RgbTriplet>

export type SemanticColor = keyof typeof semanticLight

export const semanticColors: {
  light: ColorSet<SemanticColor>
  dark: ColorSet<SemanticColor>
} = {
  light: semanticLight,
  dark: {
    background: '9 9 11', // zinc-950 #09090B
    foreground: '250 250 250',
    'foreground-soft': '212 212 216', // zinc-300
    card: '24 24 27', // zinc-900
    'card-foreground': '250 250 250',
    popover: '39 39 42', // zinc-800
    'popover-foreground': '250 250 250',
    primary: '129 140 248', // indigo-400 #818CF8
    'primary-hover': '165 180 252', // indigo-300
    'primary-foreground': '30 27 75', // indigo-950
    hero: '67 56 202', // indigo-700
    'hero-hover': '55 48 163', // indigo-800
    'hero-foreground': '255 255 255',
    secondary: '30 27 75', // indigo-950
    'secondary-foreground': '165 180 252',
    muted: '39 39 42', // zinc-800
    'muted-foreground': '161 161 170', // zinc-400
    accent: '39 39 42',
    'accent-foreground': '250 250 250',
    gold: '251 191 36', // amber-400
    'gold-foreground': '24 24 27',
    destructive: '248 113 113', // red-400
    'destructive-foreground': '9 9 11',
    'destructive-soft': '69 10 10', // red-950
    success: '74 222 128', // green-400
    'success-foreground': '9 9 11',
    warning: '251 191 36',
    'warning-foreground': '9 9 11',
    info: '96 165 250', // blue-400
    'info-foreground': '9 9 11',
    border: '39 39 42',
    input: '63 63 70', // zinc-700
    ring: '129 140 248',
  },
}

/**
 * Corner radii. `base` is emitted as `--radius` for code that
 * reads it at runtime. Inputs, chips and small buttons use 14px, the main
 * call-to-action 16px, cards and list groups 18px, large cards 22px and
 * sheets 24px.
 */
export const radius = {
  base: '14px',
  input: '14px',
  // The selected segment inside a `rounded-input` control with 4px padding:
  // 14 − 4, so the inner corner runs parallel to the outer one.
  segment: '10px',
  btn: '16px',
  card: '18px',
  'card-lg': '22px',
  sheet: '24px',
} as const

/** Spacing added on top of Tailwind's default 4px scale. */
export const spacing = {
  gutter: '20px', // screen side padding
  section: '64px',
  'section-lg': '120px',
} as const

/**
 * Font families. On native each weight is its own family, so each weight gets a token
 * (`font-sans-semibold`); the names are the ones `@expo-google-fonts` registers, loaded by
 * `useAppFonts` in the mobile app. They work on the web too, through react-native-web, once
 * the same fonts are loaded there.
 *
 * - `sans`: IBM Plex Sans, the UI font for English and French.
 * - `arabic`: IBM Plex Sans Arabic, the UI font for Arabic.
 * - `display`: headlines. The starter uses IBM Plex Sans SemiBold; swap in your own.
 */
export const fontFamily = {
  sans: ['IBMPlexSans_400Regular'],
  'sans-medium': ['IBMPlexSans_500Medium'],
  'sans-semibold': ['IBMPlexSans_600SemiBold'],
  arabic: ['IBMPlexSansArabic_400Regular'],
  'arabic-medium': ['IBMPlexSansArabic_500Medium'],
  'arabic-semibold': ['IBMPlexSansArabic_600SemiBold'],
  display: ['IBMPlexSans_600SemiBold'],
  'display-ar': ['IBMPlexSansArabic_600SemiBold'],
} satisfies Record<string, string[]>

const SANS_FALLBACK = ['IBM Plex Sans', 'system-ui', 'sans-serif']
const ARABIC_FALLBACK = ['IBM Plex Sans Arabic', 'system-ui', 'sans-serif']

/**
 * The web version of `fontFamily`: the same family names, each followed by a CSS fallback
 * stack for pages that haven't loaded the font files.
 */
export const webFontFamily = {
  sans: [...fontFamily.sans, ...SANS_FALLBACK],
  'sans-medium': [...fontFamily['sans-medium'], ...SANS_FALLBACK],
  'sans-semibold': [...fontFamily['sans-semibold'], ...SANS_FALLBACK],
  arabic: [...fontFamily.arabic, ...ARABIC_FALLBACK],
  'arabic-medium': [...fontFamily['arabic-medium'], ...ARABIC_FALLBACK],
  'arabic-semibold': [...fontFamily['arabic-semibold'], ...ARABIC_FALLBACK],
  display: [...fontFamily.display, ...SANS_FALLBACK],
  'display-ar': [...fontFamily['display-ar'], ...ARABIC_FALLBACK],
  mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
} satisfies Record<string, string[]>

/**
 * Type scale (`text-display`, `text-title-lg` … `text-tiny`), as Tailwind
 * `fontSize` entries. Families and weights are set by the
 * `Text` variants.
 */
export const fontSize = {
  display: ['32px', { lineHeight: '37px', letterSpacing: '0' }],
  'title-lg': ['30px', { lineHeight: '35px', letterSpacing: '0' }],
  'title-md': ['24px', { lineHeight: '30px', letterSpacing: '0' }],
  'title-sm': ['20px', { lineHeight: '26px', letterSpacing: '0' }],
  'title-xs': ['17px', { lineHeight: '22px', letterSpacing: '0' }],
  'body-lg': ['17px', { lineHeight: '25px', letterSpacing: '0' }],
  'body-md': ['16px', { lineHeight: '23px', letterSpacing: '0' }],
  'body-sm': ['14px', { lineHeight: '20px', letterSpacing: '0' }],
  caption: ['13px', { lineHeight: '18px', letterSpacing: '0' }],
  tiny: ['11px', { lineHeight: '14px', letterSpacing: '0' }],
  label: ['17px', { lineHeight: '22px', letterSpacing: '0' }],
  'label-sm': ['15px', { lineHeight: '20px', letterSpacing: '0' }],
  kicker: ['13px', { lineHeight: '18px', letterSpacing: '0.78px' }],
  // Arabic headings need taller lines for marks above and below the letters.
  'display-ar': ['32px', { lineHeight: '48px', letterSpacing: '0' }],
  'title-lg-ar': ['30px', { lineHeight: '45px', letterSpacing: '0' }],
  'title-md-ar': ['24px', { lineHeight: '36px', letterSpacing: '0' }],
} satisfies Record<
  string,
  [string, { lineHeight: string; letterSpacing: string }]
>

/**
 * Elevation. The look is flat: cards sit on a 1px border, so only sheets
 * and floating elements get a soft shadow.
 */
export const boxShadow = {
  'elevation-1': '0px 1px 2px 0px rgba(9, 9, 11, 0.06)',
  'elevation-2': '0px 4px 12px 0px rgba(9, 9, 11, 0.08)',
  'elevation-3': '0px 12px 32px 0px rgba(9, 9, 11, 0.16)',
} satisfies Record<string, string>
