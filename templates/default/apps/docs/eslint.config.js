import { nextJsConfig } from '@starter/config/eslint/next'

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  { ignores: ['.source/**', '.next/**', 'next-env.d.ts'] },
]
