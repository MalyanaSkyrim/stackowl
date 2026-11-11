import { defineConfig } from 'tsup'

import { env } from './src/env'

export default defineConfig({
  entry: ['src/app.ts'],
  outDir: 'build',
  bundle: true,
  sourcemap: true,
  clean: true,
  minify: env.NODE_ENV === 'production',
  skipNodeModulesBundle: true,
  target: 'node22',
  banner: {
    js: `import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);`,
  },
  external: [
    '@prisma/client',
    '@prisma/client/runtime/library',
    '@prisma/client-runtime-utils',
  ],
  format: ['esm'],
  noExternal: ['@starter/common', '@starter/database'],
})
