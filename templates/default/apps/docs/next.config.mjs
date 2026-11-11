import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX()

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // The pages import the brand from @starter/common, which ships TypeScript.
  transpilePackages: ['@starter/common'],
}

export default withMDX(config)
