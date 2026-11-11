import { ghLoggedIn, ghNames, ghVariables } from '../lib/github'
import { has, run } from '../lib/run'
import type { Context, Module } from '../types'

/** Each configured variable with the value it should have, or undefined when nothing sets it. */
export function desiredVariables(ctx: Pick<Context, 'config' | 'env'>) {
  return Object.entries(ctx.config.github?.variables ?? {}).map(
    ([name, variable]) => ({
      name,
      why: variable.why,
      value: ctx.env[name] || variable.fallback,
    }),
  )
}

/** Sets the repository variables that are missing or different. Shared with `github vars`. */
export async function syncVariables(ctx: Context): Promise<void> {
  const { report, config } = ctx
  const current = ghVariables(config.root)
  if (!current) {
    report.problem(
      "gh can't read the repository variables: is gh logged in (gh auth login)?",
    )
    return
  }
  const variables = desiredVariables(ctx)
  if (variables.length === 0) report.note('no variables in github.variables')
  for (const { name, why, value } of variables) {
    const reason = why ? ` (${why})` : ''
    if (!value) {
      report.note(
        current.has(name)
          ? `${name} is set on GitHub; not in ${config.envFile}, left as it is`
          : `${name} is not set anywhere: add it to ${config.envFile}${reason}`,
      )
      continue
    }
    if (current.get(name) === value) {
      report.ok(`${name} is up to date`)
      continue
    }
    await report.change(
      `${current.has(name) ? 'update' : 'set'} ${name}${reason}`,
      () =>
        run('gh', ['variable', 'set', name, '--body', value], {
          cwd: config.root,
        }).ok,
    )
  }
}

const ready = (ctx: Context) => {
  if (!has('gh')) {
    ctx.report.note(
      'gh is not installed (https://cli.github.com): GitHub skipped',
    )
    return false
  }
  if (!ghLoggedIn()) {
    ctx.report.note('gh is not logged in (gh auth login): GitHub skipped')
    return false
  }
  const repo = run(
    'gh',
    ['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner'],
    {
      cwd: ctx.config.root,
    },
  )
  if (!repo.ok) {
    ctx.report.note(
      'this folder has no GitHub remote gh can read: GitHub skipped',
    )
    return false
  }
  ctx.report.ok(`repository ${repo.stdout}`)
  return true
}

export const githubModule: Module = {
  id: 'github',
  title: 'GitHub',
  description:
    'Repository variables, secrets, environment secrets, labels and branches.',
  docs: 'modules/github.mdx',
  enabled: (config) => Boolean(config.github),
  check(ctx) {
    const { report, config } = ctx
    const github = config.github ?? {}
    if (!ready(ctx)) return
    const cwd = config.root

    if (github.variables) {
      const current = ghVariables(cwd)
      if (!current) report.note("can't read repository variables")
      else {
        const variables = desiredVariables(ctx)
        const missing = variables
          .filter((v) => !current.has(v.name))
          .map((v) => v.name)
        const stale = variables
          .filter(
            (v) =>
              v.value && current.has(v.name) && current.get(v.name) !== v.value,
          )
          .map((v) => v.name)
        if (missing.length === 0 && stale.length === 0)
          report.ok('repository variables')
        if (missing.length > 0)
          report.problem(
            `variables missing: ${missing.join(', ')} (stackowl github vars --apply)`,
          )
        if (stale.length > 0)
          report.note(
            `variables differ from ${config.envFile}: ${stale.join(', ')} (stackowl github vars --apply)`,
          )
      }
    }

    if (github.secrets?.length) {
      const names = ghNames(
        'repos/{owner}/{repo}/actions/secrets?per_page=100',
        '.secrets[]',
        cwd,
      )
      if (!names) report.note("can't read repository secrets")
      else {
        const missing = github.secrets.filter((name) => !names.has(name))
        if (missing.length === 0) report.ok('repository secrets')
        else report.problem(`repository secrets missing: ${missing.join(', ')}`)
      }
    }

    for (const [environment, secrets] of Object.entries(
      github.environmentSecrets ?? {},
    )) {
      const names = ghNames(
        `repos/{owner}/{repo}/environments/${encodeURIComponent(environment)}/secrets?per_page=100`,
        '.secrets[]',
        cwd,
      )
      if (!names) {
        report.problem(
          `can't read the ${environment} environment's secrets: does it exist?`,
        )
        continue
      }
      const missing = secrets.filter((name) => !names.has(name))
      if (missing.length === 0)
        report.ok(`secrets of the ${environment} environment`)
      else
        report.problem(
          `${environment} environment secrets missing: ${missing.join(', ')}`,
        )
    }

    if (github.labels?.length) {
      const names = ghNames(
        'repos/{owner}/{repo}/labels?per_page=100',
        '.[]',
        cwd,
      )
      if (names) {
        const missing = github.labels.filter((name) => !names.has(name))
        if (missing.length === 0) report.ok('labels')
        else
          report.note(
            `labels missing: ${missing.join(', ')} (stackowl setup github --apply)`,
          )
      }
    }

    for (const branch of github.branches ?? []) {
      if (
        run('gh', ['api', `repos/{owner}/{repo}/branches/${branch}`], { cwd })
          .ok
      )
        report.ok(`${branch} branch`)
      else
        report.note(`no ${branch} branch yet: git push origin main:${branch}`)
    }
  },
  async setup(ctx) {
    const { report, config } = ctx
    const github = config.github ?? {}
    if (!ready(ctx)) return
    if (github.variables) await syncVariables(ctx)

    if (github.labels?.length) {
      const names = ghNames(
        'repos/{owner}/{repo}/labels?per_page=100',
        '.[]',
        config.root,
      )
      if (!names) report.note("can't read labels")
      else
        for (const label of github.labels) {
          if (names.has(label)) report.ok(`label ${label}`)
          else
            await report.change(
              `create label ${label}`,
              () =>
                run('gh', ['label', 'create', label], { cwd: config.root }).ok,
            )
        }
    }
  },
}
