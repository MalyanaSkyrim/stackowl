/**
 * Writes the web CSS variables from `src/tokens.ts` to `tokens.css`
 * (`:root` for light mode, `.dark` for dark mode).
 *
 * Run with `pnpm --filter=@starter/design-tokens generate`. The output is
 * committed so apps work without a build step; `pnpm ... check` fails when it
 * is stale.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { colorVars } from '../src/css-vars'
import { radius } from '../src/tokens'

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

const HEADER =
  '/* Generated from packages/design-tokens/src/tokens.ts. Do not edit; run `pnpm --filter=@starter/design-tokens generate`. */\n'

// An empty block is written as `{\n}` so the output already matches Prettier.
const block = (selector: string, vars: Record<string, string>) =>
  `${selector} {\n${Object.entries(vars)
    .map(([name, value]) => `  ${name}: ${value};\n`)
    .join('')}}\n`

const files: Record<string, string> = {
  'tokens.css':
    HEADER +
    block(':root', { '--radius': radius.base, ...colorVars('light') }) +
    '\n' +
    block('.dark', colorVars('dark')),
}

const check = process.argv.includes('--check')
const stale: string[] = []

for (const [path, content] of Object.entries(files)) {
  const target = join(packageRoot, path)
  if (check) {
    let current = ''
    try {
      current = readFileSync(target, 'utf8')
    } catch {
      // Missing file counts as stale.
    }
    if (current !== content) stale.push(path)
    continue
  }
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, content)
  console.log(`wrote ${path}`)
}

if (stale.length > 0) {
  console.error(
    `Stale design tokens: ${stale.join(', ')}. Run \`pnpm --filter=@starter/design-tokens generate\`.`,
  )
  process.exit(1)
}
