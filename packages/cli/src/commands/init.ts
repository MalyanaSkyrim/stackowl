/** `init`: writes a commented `setupwise.config.ts` from a few questions. */
import {
  appendFileSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import * as p from '@clack/prompts'

import { findConfig } from '../config'
import { fail } from '../lib/output'

export type InitAnswers = {
  name: string
  environments: string[]
  modules: ('github' | 'gcp')[]
}

const list = (items: string[]) => items.map((item) => `'${item}'`).join(', ')

/** The config file's text for these answers. */
export function renderConfig(answers: InitAnswers): string {
  const github = answers.modules.includes('github')
    ? `
  // Checked by \`doctor\`; variables and labels are set by \`setup github --apply\`.
  github: {
    variables: {
      // NAME: { why: 'what reads it', fallback: 'value when the env file has none' },
      API_URL_STAGING: { why: 'the API staging builds call' },
    },
    environmentSecrets: {
      // production: ['DEPLOY_KEY'],
    },
    labels: ['migration', 'skip-staging-deploy'],
    branches: [],
  },
`
    : ''
  const gcp = answers.modules.includes('gcp')
    ? `
  // Secret Manager values per environment, set from .env.<environment> by \`secrets set\`.
  gcp: {
    projectEnv: 'GCP_PROJECT_ID',
    secrets: {
      required: ['DATABASE_URL', 'AUTH_SECRET'],
      optional: [],
    },
    // secretId: (name, environment) => \`\${name}_\${environment.toUpperCase()}\`,
    // placeholder: 'placeholder-set-a-real-value',
  },
`
    : ''

  return `import { defineConfig } from 'setupwise'

/**
 * What this project needs outside its code. \`npx setupwise doctor\` checks it,
 * \`npx setupwise setup --apply\` sets up what it can. Docs: modules and config reference.
 */
export default defineConfig({
  name: ${JSON.stringify(answers.name)},
  environments: [${list(answers.environments)}],
  node: '20',

  tools: [
    { command: 'git', required: true },
    { command: 'docker', why: 'the local database' },${answers.modules.includes('github') ? `\n    { command: 'gh', why: 'GitHub setup', install: 'https://cli.github.com' },` : ''}${answers.modules.includes('gcp') ? `\n    { command: 'gcloud', why: 'Google Cloud', install: 'https://cloud.google.com/sdk/docs/install' },` : ''}
  ],

  env: {
    required: ['DATABASE_URL'],
    groups: {
      // 'Sign-in': ['AUTH_SECRET'],
    },
  },
${github}${gcp}})
`
}

/** Makes sure `.env` and `.env.<environment>` stay out of git. */
export function ensureGitignore(root: string): boolean {
  const file = path.join(root, '.gitignore')
  const current = existsSync(file) ? readFileSync(file, 'utf8') : ''
  const lines = current.split('\n').map((line) => line.trim())
  const wanted = ['.env', '.env.*', '!.env.example'].filter(
    (line) => !lines.includes(line),
  )
  if (wanted.length === 0) return false
  appendFileSync(
    file,
    `${current && !current.endsWith('\n') ? '\n' : ''}\n# Local env files (setupwise)\n${wanted.join('\n')}\n`,
  )
  return true
}

export async function init(options: {
  yes: boolean
  force: boolean
}): Promise<number> {
  const root = process.cwd()
  const target = path.join(root, 'setupwise.config.ts')
  const existing = findConfig(root)
  if (existing && path.dirname(existing) === root && !options.force)
    fail(
      `${path.basename(existing)} already exists here. Use --force to overwrite it.`,
    )

  const defaults: InitAnswers = {
    name: path.basename(root),
    environments: ['staging', 'production'],
    modules: ['github', 'gcp'],
  }

  let answers = defaults
  if (!options.yes && process.stdin.isTTY) {
    p.intro('setupwise init')
    const result = await p.group(
      {
        name: () =>
          p.text({ message: 'Project name', initialValue: defaults.name }),
        environments: () =>
          p.text({
            message: 'Deploy environments (comma separated)',
            initialValue: defaults.environments.join(', '),
          }),
        modules: () =>
          p.multiselect({
            message:
              'Services to check and set up (tools and env are always on)',
            options: [
              {
                value: 'github',
                label: 'GitHub',
                hint: 'variables, secrets, labels, branches',
              },
              {
                value: 'gcp',
                label: 'Google Cloud',
                hint: 'Secret Manager values',
              },
            ],
            initialValues: defaults.modules,
            required: false,
          }),
      },
      { onCancel: () => fail('Cancelled.') },
    )
    answers = {
      name: String(result.name || defaults.name),
      environments: String(result.environments)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      modules: result.modules as InitAnswers['modules'],
    }
  }

  writeFileSync(target, renderConfig(answers))
  const ignored = ensureGitignore(root)
  console.log(`✓ wrote ${path.relative(root, target)}`)
  if (ignored) console.log('✓ added .env and .env.* to .gitignore')
  console.log('\nNext: fill in the config, then run  npx setupwise doctor')
  if (!options.yes && process.stdin.isTTY) p.outro('Done')
  return 0
}
