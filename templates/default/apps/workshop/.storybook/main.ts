import type { StorybookConfig } from '@storybook/react-native-web-vite'
import autoprefixer from 'autoprefixer'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from 'tailwindcss'

const here = dirname(fileURLToPath(import.meta.url))
const packages = join(here, '../../../packages')

/**
 * React Native packages that ship untranspiled JSX/Flow or ESM-only code and
 * must go through the framework's Babel pass to run in the browser.
 */
const MODULES_TO_TRANSPILE = [
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
  'nativewind',
  'react-native-css-interop',
  'react-native-reanimated',
  'react-native-worklets',
  'react-native-gesture-handler',
  'react-native-confirmation-code-field',
  'react-native-safe-area-context',
  'react-native-svg',
  'lucide-react-native',
  'expo-modules-core',
]

/**
 * `react-native-css-interop/dist/doctor.js` is CommonJS with one JSX
 * expression in it. Transforming that JSX adds an ES import, which leaves a
 * mixed module the production build won't convert (`exports is not defined`).
 * Rewrite the expression into the call the JSX runtime would make, keeping
 * the file plain CommonJS.
 */
const cssInteropDoctorPlugin = {
  name: 'workshop:css-interop-doctor',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    if (!id.includes('react-native-css-interop/dist/doctor.js')) return null
    return code.replace(
      '<react-native-css-interop-jsx-pragma-check />',
      'require("./runtime/jsx-runtime").jsx("react-native-css-interop-jsx-pragma-check", {})',
    )
  },
}

type AliasList = { find: string | RegExp; replacement: string }[]

/** Vite accepts aliases as an object or a list; Storybook may set either. */
const normalizeAliases = (
  alias: Record<string, string> | AliasList | undefined,
): AliasList =>
  Array.isArray(alias)
    ? alias
    : Object.entries(alias ?? {}).map(([find, replacement]) => ({
        find,
        replacement,
      }))

const config: StorybookConfig = {
  stories: [
    {
      directory: join(packages, 'ui/src/components'),
      files: '**/*.stories.tsx',
      titlePrefix: 'UI',
    },
  ],
  framework: {
    name: '@storybook/react-native-web-vite',
    options: {
      modulesToTranspile: MODULES_TO_TRANSPILE,
      pluginReactOptions: {
        jsxImportSource: 'nativewind',
        babel: {
          plugins: ['react-native-reanimated/plugin'],
        },
      },
    },
  },
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    plugins: [cssInteropDoctorPlugin, ...(viteConfig.plugins ?? [])],
    resolve: {
      ...viteConfig.resolve,
      alias: [...normalizeAliases(viteConfig.resolve?.alias)],
    },
    build: {
      ...viteConfig.build,
      commonjsOptions: {
        ...viteConfig.build?.commonjsOptions,
        // Some React Native packages mix ES imports with `require()` (e.g.
        // react-native-ui-datepicker); without this the production build
        // leaves those calls in and the story fails with `require is not
        // defined`, although dev mode works.
        transformMixedEsModules: true,
      },
    },
    define: {
      ...viteConfig.define,
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    },
    css: {
      ...viteConfig.css,
      postcss: {
        plugins: [
          tailwindcss({ config: join(here, '../tailwind.config.ts') }),
          autoprefixer(),
        ],
      },
    },
  }),
}

export default config
