/** Query keys we carry from the ad click through to your signup or lead form. */
export const adParamKeys = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
  'gclid',
] as const

export type AdParamKey = (typeof adParamKeys)[number]

export type AdParams = Partial<Record<AdParamKey, string>>

type ParamSource =
  | URLSearchParams
  | Record<string, string | string[] | undefined>

const readParam = (source: ParamSource, key: string): string | undefined => {
  const value =
    source instanceof URLSearchParams ? source.get(key) : source[key]

  if (Array.isArray(value)) return value[0]
  return value ?? undefined
}

/**
 * Picks the ad attribution parameters that are actually present. Absent keys
 * are left out entirely so hrefs stay short and never carry empty values.
 */
export const collectAdParams = (source: ParamSource): AdParams => {
  const params: AdParams = {}

  for (const key of adParamKeys) {
    const value = readParam(source, key)
    if (value) params[key] = value
  }

  return params
}
