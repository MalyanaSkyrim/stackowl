/** Reads the current repository through `gh api`, which works with any gh version. */
import { run } from './run'

/**
 * The entries of a GitHub REST list, one JSON object per entry picked by `jq`. Null when gh can't
 * read it (not logged in, no access, not a GitHub repository).
 */
export function ghList(
  apiPath: string,
  jq: string,
  cwd?: string,
): unknown[] | null {
  const result = run('gh', ['api', '--paginate', apiPath, '--jq', jq], { cwd })
  if (!result.ok) return null
  return result.stdout
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => JSON.parse(line) as unknown)
}

/** The `name` of every entry in a list, or null when gh can't read it. */
export function ghNames(
  apiPath: string,
  jq: string,
  cwd?: string,
): Set<string> | null {
  const items = ghList(apiPath, `${jq} | {name}`, cwd)
  if (!items) return null
  return new Set(
    items.flatMap((item) =>
      item &&
      typeof item === 'object' &&
      'name' in item &&
      typeof item.name === 'string'
        ? [item.name]
        : [],
    ),
  )
}

/** Name → value of the repository's Actions variables, or null when gh can't read them. */
export function ghVariables(cwd?: string): Map<string, string> | null {
  const items = ghList(
    'repos/{owner}/{repo}/actions/variables?per_page=100',
    '.variables[] | {name, value}',
    cwd,
  )
  if (!items) return null
  const variables = new Map<string, string>()
  for (const item of items) {
    const { name, value } = item as { name?: unknown; value?: unknown }
    if (typeof name === 'string' && typeof value === 'string')
      variables.set(name, value)
  }
  return variables
}

export const ghLoggedIn = () => run('gh', ['auth', 'status']).ok
