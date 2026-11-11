import { semanticColors, type RgbTriplet } from './tokens'

export type ColorScheme = 'light' | 'dark'

/** Colors are emitted as `--<name>`, e.g. `--primary`. */
export const COLOR_VAR_PREFIX = '--'

/** Every color variable for one scheme, e.g. `{ '--primary': '15 76 69' }`. */
export const colorVars = (scheme: ColorScheme): Record<string, RgbTriplet> =>
  Object.fromEntries(
    Object.entries(semanticColors[scheme]).map(([name, value]) => [
      `${COLOR_VAR_PREFIX}${name}`,
      value,
    ]),
  )
