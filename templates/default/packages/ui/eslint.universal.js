import pluginReact from 'eslint-plugin-react'
import tsEslint from 'typescript-eslint'

// Lower-case JSX tags that only exist in the DOM. The kit is universal: it
// renders on native through React Native and on the web through
// react-native-web, so components use View, Text, Pressable, TextInput,
// react-native-svg and the kit's own components instead.
export const DOM_ELEMENTS = [
  'a',
  'abbr',
  'article',
  'aside',
  'audio',
  'b',
  'blockquote',
  'br',
  'button',
  'canvas',
  'caption',
  'code',
  'dd',
  'details',
  'dialog',
  'div',
  'dl',
  'dt',
  'em',
  'fieldset',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hr',
  'i',
  'iframe',
  'img',
  'input',
  'label',
  'legend',
  'li',
  'main',
  'nav',
  'ol',
  'optgroup',
  'option',
  'p',
  'picture',
  'pre',
  'section',
  'select',
  'small',
  'source',
  'span',
  'strong',
  'sub',
  'summary',
  'sup',
  'svg',
  'table',
  'tbody',
  'td',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
  'video',
]

export const UNIVERSAL_MESSAGE =
  '@starter/ui is universal (native and web): use React Native primitives (View, Text, Pressable, TextInput), react-native-svg or a kit component.'

/** The two rules that keep @starter/ui universal. */
export const universalRules = {
  'react/forbid-elements': [
    'error',
    {
      forbid: DOM_ELEMENTS.map((element) => ({
        element,
        message: UNIVERSAL_MESSAGE,
      })),
    },
  ],
  'no-restricted-imports': [
    'error',
    {
      paths: [{ name: 'react-dom', message: UNIVERSAL_MESSAGE }],
      patterns: [{ group: ['react-dom/*'], message: UNIVERSAL_MESSAGE }],
    },
  ],
}

/** Files the rules apply to, and the one exemption (see eslint.config.js). */
export const universalFiles = ['src/**/*.{ts,tsx}']
export const universalIgnores = ['src/emails/**']

/**
 * A standalone flat config with only these rules. scripts/check-universal.mjs
 * runs it so violations fail as errors; the shared base config turns every
 * error into a warning (eslint-plugin-only-warn).
 */
export const universalConfig = [
  { ignores: universalIgnores },
  {
    files: universalFiles,
    // Inline eslint-disable comments are ignored here: they name rules this
    // config doesn't load, and the DOM ban shouldn't be switchable per line.
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: 'off',
    },
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react: pluginReact },
    settings: { react: { version: 'detect' } },
    rules: universalRules,
  },
]
