import { boxShadow, fontSize, radius } from '@starter/design-tokens'
import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * tailwind-merge only knows Tailwind's default scales, so it reads custom
 * token classes such as `text-title-lg` as a text color and `rounded-btn` or
 * `shadow-elevation-2` as unknown. Registering the token names keeps
 * `cn('text-title-lg', 'text-muted-foreground')` and
 * `cn('rounded-btn', 'rounded-full')` merging the way the defaults do.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: Object.keys(fontSize),
      radius: Object.keys(radius),
      shadow: Object.keys(boxShadow),
    },
  },
})

/** Joins class names and resolves Tailwind conflicts (later classes win). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** The original name of `cn`, kept so existing imports keep working. */
export const classMerge = cn
