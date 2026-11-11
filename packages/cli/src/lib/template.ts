/**
 * Getting a template onto disk and turning it into a new project: copy it (from the copy bundled
 * in this package, a GitHub repository or a local folder), replace its tokens, and restore the
 * dotfiles npm can't ship.
 */
import { randomBytes } from 'node:crypto'
import { createServer } from 'node:net'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { fail } from './output'
import { has, run } from './run'

/** What a template's `setupwise.template.json` declares. */
export type TemplateManifest = {
  name?: string
  tokens: { find: string; value: keyof ProjectValues }[]
  env?: { generate?: string[]; set?: Record<string, keyof ProjectValues> }
  setup?: { title: string; run: string; needs?: string }[]
  /** Local ports the project's services use, set in `.env`; taken ones move to free ones. */
  ports?: { env: string; default: number }[]
  next?: string[]
}

/** The answers every token is computed from. */
export type ProjectValues = {
  displayName: string
  slug: string
  scope: string
  pascal: string
  snake: string
  compact: string
  bundleId: string
  owner: string
  domain: string
}

export const MANIFEST = 'setupwise.template.json'

/** npm drops these from a package, so the bundled template stores them under another name. */
export const PACKED_DOTFILES = ['.gitignore', '.npmrc']
export const packedName = (dotfile: string) => `_dot_${dotfile.slice(1)}`

/** Never copied from a template: build output, dependencies, local secrets, git history. */
const SKIP = new Set([
  '.git',
  'node_modules',
  '.next',
  '.turbo',
  '.source',
  '.expo',
  'dist',
  'build',
  'coverage',
  'generated',
  '.DS_Store',
])
const skipFile = (name: string) =>
  SKIP.has(name) || (name.startsWith('.env') && name !== '.env.example')

export function words(input: string): string[] {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase())
}

/** Every spelling of the project's name, from its display name. */
export function projectValues(input: {
  displayName: string
  bundleId?: string
  owner?: string
  domain?: string
}): ProjectValues {
  const parts = words(input.displayName)
  if (parts.length === 0) fail('The project name needs at least one letter or digit.')
  const slug = parts.join('-')
  const compact = parts.join('')
  return {
    displayName: input.displayName.trim(),
    slug,
    scope: `@${slug}/`,
    pascal: parts.map((part) => part[0]!.toUpperCase() + part.slice(1)).join(''),
    snake: parts.join('_'),
    compact,
    bundleId: input.bundleId || `com.example.${compact}`,
    owner: input.owner || 'your-github-user',
    domain: input.domain || 'example.com',
  }
}

export const isBundleId = (value: string) =>
  /^[a-zA-Z][a-zA-Z0-9-]*(\.[a-zA-Z][a-zA-Z0-9-]*)+$/.test(value)

/** The template bundled with this package, or the repository's own copy in a checkout. */
export function bundledTemplate(): string {
  const here = path.dirname(fileURLToPath(import.meta.url))
  for (const candidate of [
    path.resolve(here, '../template'),
    path.resolve(here, '../../template'),
    path.resolve(here, '../../../templates/default'),
    path.resolve(here, '../../../../templates/default'),
  ])
    if (existsSync(path.join(candidate, MANIFEST))) return candidate
  return fail('The bundled template is missing from this install of setupwise.')
}

/** The folder this package runs from, when it is a checkout rather than an npm install. */
export function localCheckout(): string | null {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const pkg = path.resolve(here, '..')
  if (pkg.split(path.sep).includes('node_modules')) return null
  return existsSync(path.join(pkg, 'package.json')) &&
    existsSync(path.resolve(pkg, '../../templates/default'))
    ? pkg
    : null
}

/**
 * Copies a template into `target`. `from` is empty for the bundled template, `github:owner/repo`
 * (with an optional `#ref` and `/sub/folder`) for a GitHub repository, or a local folder.
 */
export async function fetchTemplate(from: string | undefined, target: string): Promise<string> {
  if (!from) {
    const source = bundledTemplate()
    copyTree(source, target)
    return 'the bundled starter'
  }
  const github = /^(?:github:|https:\/\/github\.com\/)([\w.-]+)\/([\w.-]+?)(?:\.git)?(\/[^#]*)?(?:#(.+))?$/.exec(
    from,
  )
  if (github) {
    const [, owner, repo, sub, ref] = github
    const folder = await downloadGithub(owner!, repo!, ref)
    const source = sub ? path.join(folder, sub) : folder
    if (!existsSync(source)) fail(`${sub} is not in ${owner}/${repo}.`)
    copyTree(source, target)
    rmSync(folder, { recursive: true, force: true })
    return `github:${owner}/${repo}${sub ?? ''}${ref ? `#${ref}` : ''}`
  }
  const local = path.resolve(from)
  if (!existsSync(local) || !statSync(local).isDirectory()) fail(`No folder at ${from}.`)
  copyTree(local, target)
  return local
}

async function downloadGithub(owner: string, repo: string, ref?: string): Promise<string> {
  const folder = mkdtempSync(path.join(tmpdir(), 'setupwise-'))
  const archive = path.join(folder, 'template.tar.gz')
  const url = `https://codeload.github.com/${owner}/${repo}/tar.gz/${ref ?? 'HEAD'}`
  const response = await fetch(url).catch(() => null)
  if (response?.ok) {
    writeFileSync(archive, Buffer.from(await response.arrayBuffer()))
  } else if (has('gh')) {
    // A private repository: download through the gh login.
    const result = run('gh', [
      'api',
      `repos/${owner}/${repo}/tarball${ref ? `/${ref}` : ''}`,
      '--output',
      archive,
    ])
    if (!result.ok) fail(`Can't download ${owner}/${repo}: ${result.stderr || 'not found or no access'}.`)
  } else {
    fail(`Can't download ${owner}/${repo} (${response?.status ?? 'no network'}). For a private repository, install gh and run gh auth login.`)
  }
  const extracted = path.join(folder, 'source')
  mkdirSync(extracted)
  const untar = run('tar', ['-xzf', archive, '-C', extracted, '--strip-components=1'])
  if (!untar.ok) fail(`Can't extract the ${owner}/${repo} archive: ${untar.stderr}`)
  return extracted
}

function copyTree(source: string, target: string) {
  mkdirSync(target, { recursive: true })
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (skipFile(entry.name)) continue
    const from = path.join(source, entry.name)
    const to = path.join(target, entry.name)
    if (entry.isDirectory()) copyTree(from, to)
    else if (entry.isFile()) cpSync(from, to)
  }
}

/** Every file under `root`, relative paths. */
export function listFiles(root: string, dir = ''): string[] {
  return readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(dir, entry.name)
    if (entry.isDirectory()) return listFiles(root, relative)
    return entry.isFile() ? [relative] : []
  })
}

/** Text files only: a NUL byte in the first 8 KB means binary (images, fonts). */
const isText = (buffer: Buffer) => !buffer.subarray(0, 8000).includes(0)

/** Renames `_dot_gitignore` back to `.gitignore` everywhere (see PACKED_DOTFILES). */
export function restoreDotfiles(root: string) {
  for (const file of listFiles(root)) {
    const base = path.basename(file)
    for (const dotfile of PACKED_DOTFILES)
      if (base === packedName(dotfile))
        renameSync(path.join(root, file), path.join(root, path.dirname(file), dotfile))
  }
}

export function readManifest(root: string): TemplateManifest {
  const file = path.join(root, MANIFEST)
  if (!existsSync(file)) return { tokens: [] }
  const manifest = JSON.parse(readFileSync(file, 'utf8')) as TemplateManifest
  return { ...manifest, tokens: manifest.tokens ?? [] }
}

/** Replaces each token with its value in a string, in the manifest's order. */
export function replaceTokens(
  text: string,
  manifest: TemplateManifest,
  values: ProjectValues,
): string {
  let result = text
  for (const { find, value } of manifest.tokens) {
    const replacement = values[value]
    if (replacement !== undefined && replacement !== find) result = result.split(find).join(replacement)
  }
  return result
}

/** Replaces the tokens in every text file and file name. Returns how many files changed. */
export function applyTokens(root: string, manifest: TemplateManifest, values: ProjectValues): number {
  let changed = 0
  for (const file of listFiles(root)) {
    const full = path.join(root, file)
    const buffer = readFileSync(full)
    if (isText(buffer)) {
      const text = buffer.toString('utf8')
      const next = replaceTokens(text, manifest, values)
      if (next !== text) {
        writeFileSync(full, next)
        changed++
      }
    }
    const renamed = replaceTokens(path.basename(file), manifest, values)
    if (renamed !== path.basename(file)) renameSync(full, path.join(path.dirname(full), renamed))
  }
  return changed
}

const DEPENDENCY_FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']

/**
 * Sorts the dependencies of every package.json: renaming the package scope changes their
 * alphabetical order, and monorepo checks (manypkg) fail on unsorted lists.
 */
export function sortDependencies(root: string) {
  for (const file of listFiles(root)) {
    if (path.basename(file) !== 'package.json' || file.split(path.sep).includes('node_modules'))
      continue
    const full = path.join(root, file)
    const pkg = JSON.parse(readFileSync(full, 'utf8')) as Record<string, unknown>
    let changed = false
    for (const field of DEPENDENCY_FIELDS) {
      const deps = pkg[field]
      if (!deps || typeof deps !== 'object') continue
      const sorted = Object.fromEntries(
        Object.entries(deps).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
      )
      if (JSON.stringify(sorted) !== JSON.stringify(deps)) {
        pkg[field] = sorted
        changed = true
      }
    }
    if (changed) writeFileSync(full, `${JSON.stringify(pkg, null, 2)}\n`)
  }
}

/** Whether nothing listens on this port on this machine. */
export const portFree = (port: number) =>
  new Promise<boolean>((resolve) => {
    const server = createServer()
    server.once('error', () => resolve(false))
    server.listen(port, () => server.close(() => resolve(true)))
  })

/**
 * A free port for each of the template's services, starting from its default, so a second
 * project on the same machine doesn't clash with the first one's database.
 */
export async function choosePorts(
  ports: { env: string; default: number }[],
): Promise<Record<string, { from: number; to: number }>> {
  const taken = new Set<number>()
  const chosen: Record<string, { from: number; to: number }> = {}
  for (const { env, default: start } of ports) {
    let port = start
    while (taken.has(port) || !(await portFree(port))) port += 1
    taken.add(port)
    chosen[env] = { from: start, to: port }
  }
  return chosen
}

/** A random secret for local development. */
export const randomSecret = () => randomBytes(32).toString('base64')

/** Sets keys in a dotenv text, keeping its comments and order; adds missing keys at the end. */
export function setEnvValues(text: string, values: Record<string, string>): string {
  const remaining = new Map(Object.entries(values))
  const lines = text.split('\n').map((line) => {
    const match = /^([A-Z0-9_]+)=/.exec(line)
    if (!match || !remaining.has(match[1]!)) return line
    const value = remaining.get(match[1]!)!
    remaining.delete(match[1]!)
    return `${match[1]}=${JSON.stringify(value)}`
  })
  for (const [key, value] of remaining) lines.push(`${key}=${JSON.stringify(value)}`)
  return lines.join('\n')
}
