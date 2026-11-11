import pc from 'picocolors'

import { loadConfig, loadEnv } from '../config'
import { createReporter } from '../lib/output'
import { selectModules } from '../modules'
import type { Context } from '../types'

export const DOCS_BASE =
  'https://malyanaskyrim.github.io/stackowl/docs'

/**
 * Turns a module's `docs` into a full link. A path is the page's file in apps/docs/content
 * (`modules/tools.mdx`), read against the published docs (`…/modules/tools/`).
 */
export const docsLink = (docs: string) =>
  /^https?:\/\//.test(docs) ? docs : `${DOCS_BASE}/${docs.replace(/\.mdx?$/, '/')}`

type Options = {
  ids: string[]
  apply: boolean
  configFile?: string
  json?: boolean
}

/** `doctor`: every module's check. Read only. Returns the exit code. */
export async function doctor(options: Options): Promise<number> {
  const config = await loadConfig({ file: options.configFile })
  const report = createReporter({ apply: false, quiet: options.json })
  const ctx: Context = { config, env: loadEnv(config), report, apply: false }
  const results: { id: string; lines: typeof report.lines }[] = []

  if (!options.json) {
    console.log(pc.bold(`${config.name}: doctor`))
    if (!config.file)
      console.log(
        pc.dim(
          'No stackowl.config found: checking the basics only. Run stackowl init.',
        ),
      )
  }
  for (const module of selectModules(config, options.ids)) {
    const start = report.lines.length
    const before = report.problems
    report.heading(module.title)
    await module.check(ctx)
    if (report.problems > before && module.docs && !options.json)
      console.log(pc.dim(`    how to fix: ${docsLink(module.docs)}`))
    results.push({ id: module.id, lines: report.lines.slice(start + 1) })
  }

  if (options.json) {
    console.log(
      JSON.stringify({ problems: report.problems, modules: results }, null, 2),
    )
  } else {
    console.log(
      report.problems === 0
        ? `\n${pc.green('Nothing to fix.')} Notes (!) are worth a look.`
        : `\n${pc.red(report.problems === 1 ? '1 problem' : `${report.problems} problems`)} to fix (✖ above).`,
    )
  }
  return report.problems === 0 ? 0 : 1
}

/** `setup`: every module's setup step, as a dry run unless `--apply`. Returns the exit code. */
export async function setup(options: Options): Promise<number> {
  const config = await loadConfig({ file: options.configFile })
  const report = createReporter({ apply: options.apply })
  const ctx: Context = {
    config,
    env: loadEnv(config),
    report,
    apply: options.apply,
  }
  const modules = selectModules(config, options.ids).filter(
    (module) => module.setup,
  )

  console.log(
    pc.bold(`${config.name}: setup`) +
      (options.apply ? '' : pc.dim(' (dry run: add --apply to change)')),
  )
  if (modules.length === 0)
    console.log(
      pc.dim('\nNo module with a setup step applies to this project.'),
    )
  for (const module of modules) {
    report.heading(module.title)
    await module.setup!(ctx)
  }
  if (!options.apply && modules.length > 0)
    console.log(
      pc.dim(
        '\nNothing was changed. Run again with --apply to make the + changes.',
      ),
    )
  return report.problems === 0 ? 0 : 1
}
