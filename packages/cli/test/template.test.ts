import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  applyTokens,
  bundledTemplate,
  fetchTemplate,
  projectValues,
  readManifest,
  replaceTokens,
  restoreDotfiles,
  setEnvValues,
} from '../src/lib/template'

const values = projectValues({
  displayName: 'Habit Tracker',
  bundleId: 'com.acme.habits',
  owner: 'acme',
  domain: 'habits.app',
})

describe('project values', () => {
  it('spells the name every way', () => {
    expect(values).toMatchObject({
      slug: 'habit-tracker',
      scope: '@habit-tracker/',
      pascal: 'HabitTracker',
      snake: 'habit_tracker',
      compact: 'habittracker',
    })
    expect(projectValues({ displayName: 'myCoolApp' }).slug).toBe('my-cool-app')
  })
})

describe('tokens', () => {
  const manifest = readManifest(bundledTemplate())

  it('replaces the longest tokens first', () => {
    const text =
      'com.example.starterapp @starter/api StarterApp "Starter App" starter-app starter_app starterapp your-github-user api.example.com'
    expect(replaceTokens(text, manifest, values)).toBe(
      'com.acme.habits @habit-tracker/api HabitTracker "Habit Tracker" habit-tracker habit_tracker habittracker acme api.habits.app',
    )
  })

  it('creates a project from the bundled template with no token left', async () => {
    const target = path.join(mkdtempSync(path.join(tmpdir(), 'stackowl-create-')), 'app')
    await fetchTemplate(undefined, target)
    restoreDotfiles(target)
    applyTokens(target, readManifest(target), values)
    const pkg = readFileSync(path.join(target, 'package.json'), 'utf8')
    expect(pkg).toContain('"name": "habit-tracker"')
    expect(pkg).not.toContain('@starter/')
    expect(existsSync(path.join(target, '.gitignore'))).toBe(true)
    expect(existsSync(path.join(target, 'node_modules'))).toBe(false)
    expect(readFileSync(path.join(target, 'apps/mobile/app.config.js'), 'utf8')).toContain(
      'com.acme.habits',
    )
  })
})

describe('env', () => {
  it('sets values in place and appends new keys', () => {
    const text = '# comment\nA=""\nB="keep"\n'
    expect(setEnvValues(text, { A: 'x/y+z', C: '1' })).toBe('# comment\nA="x/y+z"\nB="keep"\n\nC="1"')
  })
})

describe('preflight', () => {
  it('reads the minimum Node.js version from engines', async () => {
    const { templateNode } = await import('../src/lib/preflight')
    expect(templateNode('>=24.11.0')).toBe('24.11')
    expect(templateNode('^20')).toBe('20')
    expect(templateNode(undefined)).toBeNull()
  })
})
