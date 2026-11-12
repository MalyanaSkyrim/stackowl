/**
 * What `create` needs on this computer before it starts: Node.js new enough for the template,
 * git, pnpm and Docker. Each missing piece is explained in plain words, and, where a package
 * manager can install it (Homebrew on macOS, winget on Windows), `create` offers to.
 */
import { spawnSync } from 'node:child_process'
import * as p from '@clack/prompts'
import pc from 'picocolors'

import { satisfies } from '../modules/tools'
import { has, run } from './run'

export type Requirement = {
  id: 'node' | 'git' | 'pnpm' | 'docker'
  name: string
  /** What breaks without it, for someone who has never used it. */
  why: string
  ok: boolean
  /** Shown instead of "missing" when it's installed but not usable yet. */
  problem?: string
  /** The command that installs it on this computer, if there is one. */
  install?: string[]
  /** A page explaining how to install it by hand. */
  manual: string
  /** Without it the project can't even be created (otherwise only a later step is skipped). */
  blocking: boolean
}

const platform = process.platform
const brew = () => has('brew')
const winget = () => has('winget')

export function dockerRunning(): boolean {
  return has('docker') && run('docker', ['info']).ok
}

/** The minimum Node.js version a template asks for in its package.json `engines`. */
export function templateNode(engines: string | undefined): string | null {
  return engines?.match(/(\d+(?:\.\d+)?)/)?.[1] ?? null
}

export function checkRequirements(nodeMinimum: string | null): Requirement[] {
  const node = process.versions.node
  const nodeOk = !nodeMinimum || satisfies(node, nodeMinimum)
  const major = nodeMinimum?.split('.')[0] ?? '24'
  return [
    {
      id: 'node',
      name: `Node.js ${nodeMinimum ?? ''}`.trim(),
      why: 'runs the website, the API and the build tools',
      ok: nodeOk,
      problem: nodeOk ? undefined : `this computer has Node.js ${node}, the project needs ${nodeMinimum} or newer`,
      install:
        platform === 'darwin' && brew()
          ? ['brew', 'install', `node@${major}`]
          : platform === 'win32' && winget()
            ? ['winget', 'install', '--id', 'OpenJS.NodeJS.LTS', '--exact', '--silent']
            : undefined,
      manual: 'https://nodejs.org/en/download',
      blocking: false,
    },
    {
      id: 'git',
      name: 'git',
      why: 'keeps the history of your code (the project starts with a first commit)',
      ok: has('git'),
      install:
        platform === 'darwin'
          ? ['xcode-select', '--install']
          : platform === 'win32' && winget()
            ? ['winget', 'install', '--id', 'Git.Git', '--exact', '--silent']
            : undefined,
      manual: 'https://git-scm.com/downloads',
      blocking: false,
    },
    {
      id: 'pnpm',
      name: 'pnpm',
      why: 'installs the project’s packages',
      // corepack ships with Node.js, so pnpm is one command away.
      ok: has('pnpm'),
      install: has('corepack') ? ['corepack', 'enable'] : undefined,
      manual: 'https://pnpm.io/installation',
      blocking: false,
    },
    {
      id: 'docker',
      name: 'Docker',
      why: 'runs the local database the API uses',
      ok: dockerRunning(),
      problem: has('docker') && !dockerRunning() ? 'Docker is installed but not running' : undefined,
      install: has('docker')
        ? platform === 'darwin'
          ? ['open', '-a', 'Docker']
          : platform === 'win32'
            ? ['cmd', '/c', 'start', '', 'C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe']
            : undefined
        : platform === 'darwin' && brew()
          ? ['brew', 'install', '--cask', 'docker']
          : platform === 'win32' && winget()
            ? ['winget', 'install', '--id', 'Docker.DockerDesktop', '--exact', '--silent']
            : undefined,
      manual: 'https://docs.docker.com/get-started/get-docker/',
      blocking: false,
    },
  ]
}

const describe = (req: Requirement) => req.problem ?? `${req.name} is not installed: it ${req.why}`

/** Waits up to `seconds` for Docker to answer, after starting Docker Desktop. */
function waitForDocker(seconds: number): boolean {
  for (let i = 0; i < seconds; i += 3) {
    if (dockerRunning()) return true
    // A blocking 3-second pause that works on every platform (no `sleep` command on Windows).
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 3000)
  }
  return dockerRunning()
}

/**
 * Prints what this computer has, and offers to install what's missing. Returns the requirements
 * after any installs, so `create` knows which steps to skip.
 */
export async function preflight(options: {
  nodeMinimum: string | null
  interactive: boolean
}): Promise<Requirement[]> {
  let requirements = checkRequirements(options.nodeMinimum)
  const missing = requirements.filter((req) => !req.ok)
  if (missing.length === 0) return requirements

  console.log(`\n${pc.bold('This computer is missing a few tools')}`)
  for (const req of requirements)
    console.log(req.ok ? `  ${pc.green('✓')} ${req.name}` : `  ${pc.yellow('!')} ${describe(req)}`)

  const installable = missing.filter((req) => req.install)
  if (installable.length > 0 && options.interactive) {
    const answer = await p.confirm({
      message: `Install ${installable.map((req) => req.name).join(', ')} now? (${installable
        .map((req) => req.install!.join(' '))
        .join('; ')})`,
      initialValue: true,
    })
    if (answer === true) {
      for (const req of installable) {
        console.log(`\n${pc.cyan('›')} ${pc.bold(`Installing ${req.name}`)} ${pc.dim(req.install!.join(' '))}`)
        const [command, ...args] = req.install!
        const result = spawnSync(command!, args, { stdio: 'inherit', shell: platform === 'win32' })
        if (result.status !== 0) console.log(`${pc.red('✖')} couldn't install ${req.name}: see ${req.manual}`)
        if (req.id === 'node' && platform === 'darwin')
          run('brew', ['link', '--overwrite', '--force', req.install![2]!])
        if (req.id === 'docker' && (platform === 'darwin' || platform === 'win32')) {
          if (platform === 'darwin' && req.install![0] !== 'open') run('open', ['-a', 'Docker'])
          console.log(pc.dim('  waiting for Docker to start (accept its terms if a window opens)…'))
          waitForDocker(90)
        }
      }
      requirements = checkRequirements(options.nodeMinimum)
    }
  }

  const still = requirements.filter((req) => !req.ok)
  if (still.length > 0) {
    console.log(`\n${pc.dim('The project is created anyway; these steps wait until the tools are there:')}`)
    for (const req of still) console.log(`  ${pc.yellow('!')} ${req.name}: ${req.manual}`)
    if (still.some((req) => req.id === 'node'))
      console.log(
        pc.dim(
          `  Easiest on a new computer: the installer does all of it.\n  https://stackowl.dev/docs/start-here/create-an-app/`,
        ),
      )
  }
  return requirements
}
