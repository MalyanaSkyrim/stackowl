/**
 * Fails when @starter/ui renders a DOM element or imports react-dom.
 * Runs only the rules from eslint.universal.js, without the shared base
 * config, whose eslint-plugin-only-warn would turn the errors into warnings.
 */
import { ESLint } from 'eslint'

import { universalConfig } from '../eslint.universal.js'

const eslint = new ESLint({
  overrideConfigFile: true,
  overrideConfig: universalConfig,
})
const results = await eslint.lintFiles(
  process.argv.slice(2).length ? process.argv.slice(2) : ['src'],
)
const errorCount = results.reduce((sum, result) => sum + result.errorCount, 0)

if (errorCount > 0) {
  const formatter = await eslint.loadFormatter('stylish')
  console.error(await formatter.format(results))
  process.exit(1)
}
console.log('@starter/ui: no DOM elements or react-dom imports.')
