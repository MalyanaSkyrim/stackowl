// cspell:ignore bgcolor
import { config } from '@starter/config/eslint/react-internal'
import globals from 'globals'

import { universalFiles, universalRules } from './eslint.universal.js'

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    // No DOM elements or react-dom in the universal kit. Shown as warnings in
    // the editor (the base config makes every rule a warning); `pnpm lint`
    // also runs scripts/check-universal.mjs, which fails on them.
    files: universalFiles,
    rules: universalRules,
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  {
    // The React Email kit renders HTML for mail clients; it is not a UI
    // component and never runs in the apps, so DOM tags are expected here.
    files: ['src/emails/**/*.{ts,tsx}'],
    rules: {
      'react/forbid-elements': 'off',
      'no-restricted-imports': 'off',
      // Email clients (Outlook) need legacy table attributes such as `bgcolor`.
      'react/no-unknown-property': ['warn', { ignore: ['bgcolor'] }],
    },
  },
]
