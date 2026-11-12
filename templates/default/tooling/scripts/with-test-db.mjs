#!/usr/bin/env node
/**
 * Runs a command against the test database: DATABASE_URL takes the value of TEST_DATABASE_URL
 * from the root .env. Works the same on macOS, Linux and Windows (no `sh -c`).
 *
 *   node ../../tooling/scripts/with-test-db.mjs vitest
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const envFile = path.join(root, '.env')
const env = { ...process.env }
if (existsSync(envFile))
  for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
    if (match && env[match[1]] === undefined) env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
  }
if (!env.TEST_DATABASE_URL) {
  console.error('TEST_DATABASE_URL is not set. Add it to the root .env (see .env.example).')
  process.exit(1)
}
env.DATABASE_URL = env.TEST_DATABASE_URL

const [command, ...args] = process.argv.slice(2)
const result = spawnSync(command, args, { stdio: 'inherit', env, shell: process.platform === 'win32' })
process.exit(result.status ?? 1)
