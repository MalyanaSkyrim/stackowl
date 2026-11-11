import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX()

/**
 * Builds the static site GitHub Pages serves: every page and the search index become plain files
 * in `out/`. On https://stackowl.dev the site lives at the root (no base path); on
 * https://malyanaskyrim.github.io/stackowl/ it needs `DOCS_BASE_PATH=/stackowl`. The deploy
 * workflow picks one from the DOCS_DOMAIN repository variable.
 */
const basePath = process.env.DOCS_BASE_PATH ?? ''

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'export',
  basePath,
  // GitHub Pages serves `folder/index.html` for `folder/`.
  trailingSlash: true,
  // No image optimizer on a static host.
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
}

export default withMDX(config)
