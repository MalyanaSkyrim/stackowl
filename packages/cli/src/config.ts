/**
 * Finds and loads `setupwise.config.{ts,mts,js,mjs,json}`, walking up from the current folder,
 * and fills in the defaults. TypeScript configs load through jiti, with `setupwise` aliased to
 * this package, so `import { defineConfig } from 'setupwise'` works under `npx` too.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'dotenv'
import { createJiti } from 'jiti'

import { fail } from './lib/output'
import type { Config, ResolvedConfig } from './types'

export const CONFIG_FILES = [
  'setupwise.config.ts',
  'setupwise.config.mts',
  'setupwise.config.js',
  'setupwise.config.mjs',
  'setupwise.config.json',
]

/** The nearest config file at or above `from`, or null. */
export function findConfig(from: string): string | null {
  let dir = path.resolve(from)
  for (;;) {
    for (const name of CONFIG_FILES) {
      const file = path.join(dir, name)
      if (existsSync(file)) return file
    }
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

/** This package's public entry, for the `setupwise` alias inside config files. */
function apiEntry(): string {
  const here = path.dirname(fileURLToPath(import.meta.url))
  for (const candidate of ['api.js', 'api.ts']) {
    const file = path.join(here, candidate)
    if (existsSync(file)) return file
  }
  return path.join(here, 'api.js')
}

export async function loadConfigFile(file: string): Promise<Config> {
  if (file.endsWith('.json'))
    return JSON.parse(readFileSync(file, 'utf8')) as Config
  const jiti = createJiti(import.meta.url, {
    alias: { setupwise: apiEntry() },
    interopDefault: true,
    moduleCache: false,
  })
  const loaded = await jiti.import<Config | { default: Config }>(file)
  const config = 'default' in loaded && loaded.default ? loaded.default : loaded
  if (!config || typeof config !== 'object')
    fail(
      `${path.basename(file)} must export a config object (export default defineConfig({...})).`,
    )
  return config as Config
}

export function resolveConfig(
  config: Config,
  file: string | null,
  cwd = process.cwd(),
): ResolvedConfig {
  const root = file ? path.dirname(file) : cwd
  return {
    ...config,
    name: config.name ?? path.basename(root),
    envFile: config.envFile ?? '.env',
    environments: config.environments ?? ['staging', 'production'],
    root,
    file,
  }
}

/** The project's config, or defaults when there is none (so `doctor` still checks the basics). */
export async function loadConfig(
  options: { cwd?: string; file?: string } = {},
): Promise<ResolvedConfig> {
  const cwd = options.cwd ?? process.cwd()
  const file = options.file ? path.resolve(cwd, options.file) : findConfig(cwd)
  if (options.file && (!file || !existsSync(file)))
    fail(`Config file not found: ${options.file}`)
  const config = file ? await loadConfigFile(file) : {}
  return resolveConfig(config, file, cwd)
}

/** A dotenv file's values, or nothing when it doesn't exist. */
export function readEnvFile(file: string): Record<string, string> {
  return existsSync(file) ? parse(readFileSync(file)) : {}
}

/** The env file's values, with the process environment taking precedence. */
export function loadEnv(
  config: ResolvedConfig,
): Record<string, string | undefined> {
  const fromFile = readEnvFile(path.join(config.root, config.envFile))
  const merged: Record<string, string | undefined> = { ...fromFile }
  for (const [key, value] of Object.entries(process.env))
    if (value) merged[key] = value
  return merged
}
