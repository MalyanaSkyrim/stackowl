/**
 * The site's illustrations, by file name under `public/img/illustrations/`.
 * Until a file is there, `Illustration` draws a labelled placeholder of the
 * same shape, so dropping the image in (and rebuilding) is the whole change.
 */
export const illustrations = {
  'hero.png': { width: 1600, height: 1400 },
  'step-download.png': { width: 800, height: 800 },
  'step-write.png': { width: 800, height: 800 },
  'step-sync.png': { width: 800, height: 800 },
  'privacy.png': { width: 800, height: 800 },
} as const

export type IllustrationName = keyof typeof illustrations

export const ILLUSTRATIONS_DIR = '/img/illustrations'
