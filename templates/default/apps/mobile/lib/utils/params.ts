/**
 * expo-router gives a query param as `string | string[] | undefined` depending on
 * how many times it appears in the URL. Collapse that to a usable string.
 */
export function normalizeStringParam(raw: string | string[] | undefined): string | undefined {
  if (raw === undefined) {
    return undefined;
  }
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
