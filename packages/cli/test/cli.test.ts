import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { renderConfig } from '../src/commands/init'
import { findConfig, loadConfig, loadEnv } from '../src/config'
import { createReporter } from '../src/lib/output'
import { envModule } from '../src/modules/env'
import { selectModules } from '../src/modules'
import { defaultSecretId } from '../src/modules/gcp'
import { satisfies } from '../src/modules/tools'

const tempProject = () => mkdtempSync(path.join(tmpdir(), 'stackowl-'))

describe('config', () => {
  it('finds the nearest config walking up', () => {
    const root = tempProject()
    writeFileSync(path.join(root, 'stackowl.config.json'), '{"name":"demo"}')
    const nested = path.join(root, 'apps', 'api')
    mkdirSync(nested, { recursive: true })
    expect(findConfig(nested)).toBe(path.join(root, 'stackowl.config.json'))
  })

  it('loads a TypeScript config that imports stackowl, with defaults', async () => {
    const root = tempProject()
    writeFileSync(
      path.join(root, 'stackowl.config.ts'),
      renderConfig({
        name: 'demo',
        environments: ['dev', 'prod'],
        modules: ['github'],
      }),
    )
    const config = await loadConfig({ cwd: root })
    expect(config.name).toBe('demo')
    expect(config.environments).toEqual(['dev', 'prod'])
    expect(config.envFile).toBe('.env')
    expect(config.gcp).toBeUndefined()
    expect(selectModules(config, []).map((m) => m.id)).toEqual([
      'tools',
      'env',
      'github',
    ])
  })

  it('rejects unknown modules on the command line', async () => {
    const config = await loadConfig({ cwd: tempProject() })
    expect(() => selectModules(config, ['nope'])).toThrow(
      /Unknown or disabled module/,
    )
  })
})

describe('env module', () => {
  it('reports required keys as problems and groups as notes', async () => {
    const root = tempProject()
    writeFileSync(path.join(root, '.env'), 'A=1\nC=3\n')
    writeFileSync(path.join(root, '.env.example'), 'A=\nB=\nC=\nD=\n')
    writeFileSync(
      path.join(root, 'stackowl.config.json'),
      JSON.stringify({
        env: { required: ['A', 'B'], groups: { Mail: ['C'] } },
      }),
    )
    const config = await loadConfig({ cwd: root })
    const report = createReporter({ apply: false, quiet: true })
    await envModule.check({
      config,
      env: loadEnv(config),
      report,
      apply: false,
    })
    expect(report.problems).toBe(1)
    expect(report.lines.map((l) => `${l.kind}:${l.text}`)).toEqual([
      'problem:required keys not set: B',
      'ok:Mail',
      'note:in .env.example but not set: D',
    ])
  })
})

describe('helpers', () => {
  it('compares versions', () => {
    expect(satisfies('22.11.0', '22.11')).toBe(true)
    expect(satisfies('22.10.9', '22.11')).toBe(false)
    expect(satisfies('24.0.0', '>=22.11.0')).toBe(true)
  })
  it('names secrets NAME_ENVIRONMENT', () => {
    expect(defaultSecretId('DATABASE_URL', 'staging')).toBe(
      'DATABASE_URL_STAGING',
    )
    expect(defaultSecretId('KEY', 'pre-prod')).toBe('KEY_PRE_PROD')
  })
  it('dry runs never call the change', async () => {
    const report = createReporter({ apply: false, quiet: true })
    let called = false
    await report.change('set X', () => (called = true))
    expect(called).toBe(false)
    expect(report.lines[0]?.text).toBe('set X (dry run)')
  })
})

describe('windows quoting', () => {
  it('leaves plain arguments alone and quotes the rest', async () => {
    const { quoteForCmd } = await import('../src/lib/run')
    expect(quoteForCmd('--project=my-app')).toBe('--project=my-app')
    expect(quoteForCmd('Habit Tracker')).toBe('"Habit Tracker"')
    expect(quoteForCmd('say "hi"')).toBe('"say ""hi"""')
  })
})
