import localFont from 'next/font/local'

/**
 * The app's fonts (see `fontFamily` in `@starter/design-tokens`), loaded by
 * `next/font` as CSS variables. `tailwind.config.ts` puts each variable first
 * in its family, so `font-sans`, `font-arabic` and the display
 * families (IBM Plex SemiBold in the starter) pick these files on the web, kit components included.
 *
 * The files live in `files/` (Google Fonts' latin and arabic subsets, SIL Open
 * Font License: see `files/README.md`) rather than coming from
 * `next/font/google`, whose build-time download from Google failed CI builds
 * now and then.
 */
export const fontSans = localFont({
  src: [
    { path: './files/ibm-plex-sans-latin-400.woff2', weight: '400' },
    { path: './files/ibm-plex-sans-latin-500.woff2', weight: '500' },
    { path: './files/ibm-plex-sans-latin-600.woff2', weight: '600' },
  ],
  variable: '--font-plex-sans',
})

export const fontArabic = localFont({
  src: [
    { path: './files/ibm-plex-sans-arabic-400.woff2', weight: '400' },
    { path: './files/ibm-plex-sans-arabic-500.woff2', weight: '500' },
    { path: './files/ibm-plex-sans-arabic-600.woff2', weight: '600' },
  ],
  variable: '--font-plex-arabic',
})

export const fontVariables = [fontSans.variable, fontArabic.variable].join(' ')
