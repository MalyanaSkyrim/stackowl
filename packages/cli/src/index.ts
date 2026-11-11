#!/usr/bin/env node
/** The `stackowl` command. */
import { readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import pc from 'picocolors'

import { create } from './commands/create'
import { init } from './commands/init'
import { docsLink, doctor, setup } from './commands/run-modules'
import { githubVars, secretsSet } from './commands/targeted'
import { loadConfig } from './config'
import { CliError } from './lib/output'
import { builtInModules, projectModules } from './modules'

const HELP = `${pc.bold('StackOwl')}: check and set up everything your project needs outside its code.

${pc.bold('Usage')}
  stackowl create [folder]              a new project from the starter (web, API, iPhone app, docs, infra)
      --from <template>                  github:owner/repo[/folder][#ref] or a local folder instead
      --name <name> --bundle-id <id> --domain <domain> --owner <github user>
      --github                           also create the private GitHub repository and push
      --no-install --no-db --no-git      skip those steps
  stackowl init [--yes] [--force]       write stackowl.config.ts for an existing project
  stackowl doctor [module...] [--json]  check everything, change nothing (exit 1 on ✖)
  stackowl setup [module...] [--apply]  run the setup steps (dry run without --apply)
  stackowl secrets set <env> [--apply]  give cloud secrets their values from .env.<env>
  stackowl github vars [--apply]        set GitHub repository variables from the env file
  stackowl modules                      list the modules and whether this project uses them

${pc.bold('Options')}
  -c, --config <file>   use this config instead of the nearest stackowl.config.*
  --apply               make the changes (every command that changes things is a dry run without it)
  -h, --help            show this help
  -v, --version         show the version

Output: ${pc.green('✓')} fine  ${pc.yellow('!')} worth a look  ${pc.red('✖')} must be fixed  ${pc.cyan('+')} a change`

function version(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    )
    return String(pkg.version)
  } catch {
    return 'unknown'
  }
}

async function main(argv: string[]): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      apply: { type: 'boolean', default: false },
      config: { type: 'string', short: 'c' },
      json: { type: 'boolean', default: false },
      yes: { type: 'boolean', short: 'y', default: false },
      force: { type: 'boolean', default: false },
      from: { type: 'string' },
      name: { type: 'string' },
      'bundle-id': { type: 'string' },
      domain: { type: 'string' },
      owner: { type: 'string' },
      github: { type: 'boolean', default: false },
      'no-install': { type: 'boolean', default: false },
      'no-db': { type: 'boolean', default: false },
      'no-git': { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
      version: { type: 'boolean', short: 'v', default: false },
    },
  })
  if (values.version) {
    console.log(version())
    return 0
  }
  const [command, ...rest] = positionals
  if (values.help || !command) {
    console.log(HELP)
    return 0
  }
  const common = { apply: values.apply, configFile: values.config }

  switch (command) {
    case 'create':
      return create({
        dir: rest[0],
        from: values.from,
        name: values.name,
        bundleId: values['bundle-id'],
        domain: values.domain,
        owner: values.owner,
        yes: values.yes,
        install: !values['no-install'],
        db: !values['no-db'],
        git: !values['no-git'],
        github: values.github,
      })
    case 'init':
      return init({ yes: values.yes, force: values.force })
    case 'doctor':
      return doctor({ ...common, ids: rest, json: values.json })
    case 'setup':
      return setup({ ...common, ids: rest })
    case 'secrets':
      if (rest[0] !== 'set')
        throw new CliError(
          'Usage: stackowl secrets set <environment> [--apply]',
        )
      return secretsSet(rest[1], common)
    case 'secrets:set':
      return secretsSet(rest[0], common)
    case 'github':
      if (rest[0] !== 'vars')
        throw new CliError('Usage: stackowl github vars [--apply]')
      return githubVars(common)
    case 'github:vars':
      return githubVars(common)
    case 'modules': {
      const config = await loadConfig({ file: values.config })
      const used = new Set(projectModules(config).map((module) => module.id))
      for (const module of [...builtInModules, ...(config.modules ?? [])]) {
        const mark = used.has(module.id) ? pc.green('●') : pc.dim('○')
        const steps = module.setup ? 'check + setup' : 'check'
        console.log(
          `${mark} ${pc.bold(module.id.padEnd(10))} ${module.description ?? module.title} ${pc.dim(`(${steps})`)}`,
        )
        if (module.docs)
          console.log(pc.dim(`             ${docsLink(module.docs)}`))
      }
      console.log(pc.dim(`\n● used by this project  ○ not configured`))
      return 0
    }
    default:
      throw new CliError(`Unknown command "${command}". Run stackowl --help.`)
  }
}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (error: unknown) => {
    if (
      error instanceof CliError ||
      (error instanceof Error &&
        'code' in error &&
        String(error.code).startsWith('ERR_PARSE_ARGS'))
    ) {
      console.error(`${pc.red('✖')} ${error.message}`)
    } else console.error(error)
    process.exit(1)
  },
)
