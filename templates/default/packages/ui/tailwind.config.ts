import { webFontFamily } from '@starter/design-tokens'
import tokensPreset from '@starter/design-tokens/tailwind-preset'
import lineClamp from '@tailwindcss/line-clamp'
import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'
import tailwindRadix from 'tailwindcss-radix'

/**
 * Colors, radii, spacing and font families come from the shared
 * `@starter/design-tokens` preset; this file adds the web-only extras.
 */
const config = {
  presets: [tokensPreset],
  darkMode: ['class'],
  content: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'layout/**/*.{ts,tsx}',
    '../../packages/ui/src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: webFontFamily,
      boxShadow: {
        'soft-1': '0px 0px 10px rgba(38, 38, 38, 0.1)',
        'soft-2': '0px 0px 20px rgba(38, 38, 38, 0.2)',
        'soft-3': '0px 0px 30px rgba(38, 38, 38, 0.1)',
        'soft-4': '0px 0px 40px rgba(38, 38, 38, 0.1)',
        'shadow-small':
          '0px 1px 2px 0px rgba(13, 13, 18, 0.06), 0px 1px 3px 0px rgba(13, 13, 18, 0.05)',
      },
      screens: {
        '2xs': '380px',
        xs: '480px',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'loading-wave': {
          '0%': { transform: 'scale(0)', opacity: '0.8' },
          '40%': { transform: 'scale(4)', opacity: '0' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        'loading-spot-reveal': {
          '0%': { opacity: '0' },
          '10%': { opacity: '1' },
          '30%': { opacity: '1' },
          '50%': { opacity: '0' },
          '100%': { opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'loading-wave': 'loading-wave 3s ease-out infinite',
        'loading-spot-reveal': 'loading-spot-reveal 3s ease-out infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate, tailwindRadix({}), lineClamp],
} satisfies Config

export default config
