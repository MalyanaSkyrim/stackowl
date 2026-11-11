/**
 * `create`: a new project from a template, ready to run. Copies the template, gives every name
 * and id the project's own, writes `.env` with local secrets, makes the first commit, installs,
 * starts the local database and checks what is left with `doctor`.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import * as p from '@clack/prompts'
import pc from 'picocolors'

import { fail } from '../lib/output'
import { has, run } from '../lib/run'
import {
  applyTokens,
  choosePorts,
  fetchTemplate,
  isBundleId,
  localCheckout,
  MANIFEST,
  projectValues,
  randomSecret,
  readManifest,
  replaceTokens,
  restoreDotfiles,
  setEnvValues,
  sortDependencies,
  words,
} from '../lib/template'
import { doctor } from './run-modules'

export type CreateOptions = {
  dir?: string
  from?: string
  name?: string
  bundleId?: string
  domain?: string
  owner?: string
  yes: boolean
  install: boolean
  db: boolean
  git: boolean
  github: boolean
}

/** Runs a command in the new project with its output shown, and says whether it worked. */
function step(title: string, command: string, args: string[], cwd: string): boolean {
  console.log(`\n${pc.cyan('›')} ${pc.bold(title)} ${pc.dim(`(${[command, ...args].join(' ')})`)}`)
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' })
  if (result.status === 0) return true
  console.log(`${pc.red('✖')} ${title} failed. Run it again later: ${[command, ...args].join(' ')}`)
  return false
}

const ghLogin = () => {
  if (!has('gh')) return undefined
  const result = run('gh', ['api', 'user', '--jq', '.login'])
  return result.ok && result.stdout ? result.stdout : undefined
}

/** `pnpm`, or a way to run it when only Node is installed. */
function pnpmCommand(): [string, string[]] | null {
  if (has('pnpm')) return ['pnpm', []]
  if (has('corepack')) return ['corepack', ['pnpm']]
  if (has('npx')) return ['npx', ['--yes', 'pnpm@10']]
  return null
}

export async function create(options: CreateOptions): Promise<number> {
  const interactive = !options.yes && process.stdin.isTTY
  if (interactive) p.intro(pc.bold('setupwise create'))

  // --- Answers ---------------------------------------------------------------------------
  let dir = options.dir
  let displayName = options.name
  if (interactive && !dir) {
    const answer = await p.text({
      message: 'Project folder',
      placeholder: 'my-app',
      validate: (value) => (words(value).length === 0 ? 'Letters or digits, please' : undefined),
    })
    if (p.isCancel(answer)) fail('Cancelled.')
    dir = answer
  }
  if (!dir) fail('Usage: setupwise create <folder> [--from <template>] [--yes]')
  const target = path.resolve(dir)
  if (existsSync(target) && readdirSync(target).length > 0)
    fail(`${dir} already exists and isn't empty. Pick another folder.`)

  const defaultName = words(path.basename(target))
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join(' ')
  if (interactive && !displayName) {
    const answer = await p.text({ message: 'App name (shown under the icon)', initialValue: defaultName })
    if (p.isCancel(answer)) fail('Cancelled.')
    displayName = answer
  }
  displayName ||= defaultName

  const owner = options.owner || ghLogin()
  const draft = projectValues({ displayName, owner, domain: options.domain })
  let bundleId = options.bundleId
  if (interactive && !bundleId) {
    const answer = await p.text({
      message: 'Bundle id (iOS and Android, never changes after the first upload)',
      initialValue: `com.${(owner ?? 'example').toLowerCase().replace(/[^a-z0-9]/g, '')}.${draft.compact}`,
      validate: (value) => (isBundleId(value) ? undefined : 'Reverse domain style: com.company.app'),
    })
    if (p.isCancel(answer)) fail('Cancelled.')
    bundleId = answer
  }
  if (bundleId && !isBundleId(bundleId)) fail(`${bundleId} isn't a bundle id (com.company.app).`)
  let domain = options.domain
  if (interactive && !domain) {
    const answer = await p.text({
      message: 'Website domain (example.com until you have one)',
      initialValue: 'example.com',
    })
    if (p.isCancel(answer)) fail('Cancelled.')
    domain = answer
  }
  const values = projectValues({ displayName, bundleId, owner, domain })

  // --- Files -----------------------------------------------------------------------------
  const spinner = interactive ? p.spinner() : null
  spinner?.start('Copying the template')
  const source = await fetchTemplate(options.from, target)
  restoreDotfiles(target)
  const manifest = readManifest(target)
  const changed = applyTokens(target, manifest, values)
  rmSync(path.join(target, MANIFEST), { force: true })

  // setupwise itself: the published version, or this checkout while developing setupwise.
  const pkgFile = path.join(target, 'package.json')
  if (existsSync(pkgFile)) {
    const pkg = JSON.parse(readFileSync(pkgFile, 'utf8'))
    if (pkg.devDependencies?.setupwise) {
      const checkout = localCheckout()
      pkg.devDependencies.setupwise = checkout ? `link:${checkout}` : `^${version()}`
      writeFileSync(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`)
    }
  }
  sortDependencies(target)

  // .env with local secrets and free ports, from .env.example.
  const moved: string[] = []
  const example = path.join(target, '.env.example')
  if (existsSync(example)) {
    const env: Record<string, string> = {}
    for (const key of manifest.env?.generate ?? []) env[key] = randomSecret()
    for (const [key, value] of Object.entries(manifest.env?.set ?? {})) env[key] = values[value]
    let text = readFileSync(example, 'utf8')
    const ports = await choosePorts(manifest.ports ?? [])
    for (const [key, { from, to }] of Object.entries(ports)) {
      env[key] = String(to)
      if (from !== to) {
        text = text.split(`localhost:${from}`).join(`localhost:${to}`)
        moved.push(`${key} ${from} → ${to}`)
      }
    }
    writeFileSync(path.join(target, '.env'), setEnvValues(text, env))
  }
  spinner?.stop(`Copied ${source} into ${dir} (${changed} files renamed for ${values.displayName})`)
  if (!interactive) console.log(`✓ copied ${source} into ${dir}`)
  if (moved.length > 0)
    console.log(`${pc.yellow('!')} ports in use by another project, moved in .env: ${moved.join(', ')}`)

  // --- Git -------------------------------------------------------------------------------
  if (options.git && has('git')) {
    run('git', ['init', '-q', '-b', 'main'], { cwd: target })
  }

  // --- Install and local setup -----------------------------------------------------------
  const pnpm = pnpmCommand()
  let installed = false
  if (options.install) {
    if (!pnpm) console.log(`${pc.yellow('!')} pnpm isn't installed: run corepack enable, then pnpm install`)
    else installed = step('Install dependencies', pnpm[0], [...pnpm[1], 'install'], target)
  }

  if (installed && options.git && has('git')) {
    run('git', ['add', '-A'], { cwd: target })
    const commit = run('git', ['commit', '-q', '-m', `Create ${values.displayName} with setupwise`], {
      cwd: target,
    })
    if (!commit.ok)
      console.log(`${pc.yellow('!')} no first commit (set git user.name and user.email, then commit)`)
  }

  if (installed && options.db && pnpm) {
    for (const item of manifest.setup ?? []) {
      if (item.needs === 'docker' && !(has('docker') && run('docker', ['info']).ok)) {
        console.log(
          `\n${pc.yellow('!')} Docker isn't running: skipped "${item.title}" and what follows. Start Docker, then run the commands in the README.`,
        )
        break
      }
      const [command, ...args] = replaceTokens(item.run, manifest, values).split(' ')
      const ok =
        command === 'pnpm'
          ? step(item.title, pnpm[0], [...pnpm[1], ...args], target)
          : step(item.title, command!, args, target)
      if (!ok) break
    }
  }

  // --- GitHub ----------------------------------------------------------------------------
  if (options.github) {
    if (!has('gh')) console.log(`${pc.yellow('!')} gh isn't installed: skipped the GitHub repository`)
    else
      step(
        'Create the private GitHub repository and push',
        'gh',
        ['repo', 'create', `${values.owner}/${values.slug}`, '--private', '--source', '.', '--push'],
        target,
      )
  }

  // --- Check and next steps --------------------------------------------------------------
  if (installed) {
    const cwd = process.cwd()
    process.chdir(target)
    console.log('')
    await doctor({ ids: [], apply: false }).catch(() => 1)
    process.chdir(cwd)
  }

  const relative = path.relative(process.cwd(), target) || '.'
  const next = [
    `cd ${relative}`,
    ...(installed ? [] : ['pnpm install']),
    ...(manifest.next ?? []).map((line) => replaceTokens(line, manifest, values)),
  ]
  console.log(
    installed
      ? `\n${pc.green('✓')} ${pc.bold(values.displayName)} is ready in ${relative}\n`
      : `\n${pc.yellow('!')} ${pc.bold(values.displayName)} is in ${relative}, not installed yet\n`,
  )
  console.log(next.map((line) => `  ${line}`).join('\n'))
  if (interactive) p.outro('Happy building')
  return 0
}

function version(): string {
  try {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
    return String(pkg.version)
  } catch {
    return 'latest'
  }
}
