const tokensPreset = require('@starter/design-tokens/tailwind-preset');

const tokens = tokensPreset.default ?? tokensPreset;

/**
 * The Expo app's Tailwind (NativeWind) config. Colors, radii, fonts, the type
 * scale and shadows come from the shared `@starter/design-tokens` preset.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  darkMode: 'class',
  // The tokens preset must come first; see the note in tailwind-preset.ts.
  presets: [tokens, require('nativewind/preset')],
  theme: {
    extend: {
      // NativeWind's preset, applied after ours, redefines `font-sans` as
      // `'system font'`, which iOS doesn't know and draws in Times. A config's
      // own `extend` comes after every preset, so this puts IBM Plex Sans back.
      fontFamily: tokens.theme.extend.fontFamily,
    },
  },
  important: 'html',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
    './*.{js,jsx,ts,tsx}',
    // The universal kit.
    '../../packages/ui/src/components/**/*.{js,jsx,ts,tsx}',
  ],
};
