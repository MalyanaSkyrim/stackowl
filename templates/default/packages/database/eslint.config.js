import { config } from '@starter/config/eslint/base'

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: ['generated/**', 'build/**'],
  },
]
