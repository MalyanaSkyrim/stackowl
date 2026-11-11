import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

// `@starter/ui` is written in React Native. On the web it renders through
// react-native-web, and platform files (`button.web.tsx`) win over the shared
// ones. Both bundlers need the same alias and extension order.
//
// `pnpm dev` runs webpack for now: Turbopack ignores the `.web.js` order inside
// node_modules (react-native-safe-area-context then pulls in React Native's
// Flow sources and the page fails). The Turbopack settings below are kept so
// switching back is a one-flag change once that works.
const WEB_EXTENSIONS = ['.web.tsx', '.web.ts', '.web.jsx', '.web.js']
const DEFAULT_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json']

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: [
    '@starter/ui',
    '@starter/common',
    'nativewind',
    'react-native-css-interop',
    'react-native-web',
    '@rn-primitives/accordion',
    '@rn-primitives/dialog',
    '@rn-primitives/hooks',
    '@rn-primitives/label',
    '@rn-primitives/portal',
    '@rn-primitives/radio-group',
    '@rn-primitives/slot',
    '@rn-primitives/switch',
    '@rn-primitives/toggle-group',
    '@rn-primitives/types',
    '@rn-primitives/utils',
    'react-native-svg',
    'lucide-react-native',
    'expo-modules-core',
  ],
  compiler: {
    // React Native libraries read this global; Metro defines it, Next doesn't.
    define: {
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    },
  },
  experimental: {
    // `@starter/ui` is one barrel; this keeps unused components out of each page.
    optimizePackageImports: ['@starter/ui', 'lucide-react'],
  },
  turbopack: {
    resolveAlias: {
      'react-native': 'react-native-web',
    },
    resolveExtensions: [...WEB_EXTENSIONS, ...DEFAULT_EXTENSIONS],
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  images: {
    // Illustrations are served at 85; everything else keeps the default 75.
    qualities: [75, 85],
    // Add `remotePatterns` here for images served from your storage bucket or CDN.
  },

  // SVG and TypeScript module resolution configuration
  webpack(config, { dev }) {
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
    }
    config.resolve.extensions = [
      ...WEB_EXTENSIONS,
      ...(config.resolve.extensions ?? DEFAULT_EXTENSIONS),
    ]
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.tsx', '.js'],
      '.mjs': ['.mts', '.mjs'],
      '.cjs': ['.cts', '.cjs'],
    }

    // Only apply this webpack config when not using turbopack
    if (!dev) {
      const fileLoaderRule = config.module.rules.find((rule) =>
        rule.test?.test?.('.svg'),
      )

      config.module.rules.push(
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: /url/,
        },
        {
          test: /\.svg$/i,
          issuer: fileLoaderRule.issuer,
          resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
          use: ['@svgr/webpack'],
        },
      )

      fileLoaderRule.exclude = /\.svg$/i
    }

    return config
  },
}

export default withNextIntl(nextConfig)
