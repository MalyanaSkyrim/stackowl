import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX()

/**
 * `DOCS_BASE_PATH=/setupwise` builds the static site GitHub Pages serves
 * (https://malyanaskyrim.github.io/setupwise/): every page and the search index become plain
 * files in `out/`. Without it, `next dev` and `next build` work as a normal Next app.
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
