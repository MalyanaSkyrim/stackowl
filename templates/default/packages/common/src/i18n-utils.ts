/**
 * Recursive type for translation objects.
 */
export type TranslationObject = {
  [key: string]: string | TranslationObject
}

/**
 * Compares two translation objects and returns missing keys in both directions.
 * Handles nested objects recursively.
 */
export function compareTranslationKeys(
  reference: TranslationObject,
  target: TranslationObject,
  path: string = '',
): { missingInTarget: string[]; missingInReference: string[] } {
  const refKeys = Object.keys(reference)
  const targetKeys = Object.keys(target)

  const missingInTarget: string[] = refKeys
    .filter((key) => !Object.prototype.hasOwnProperty.call(target, key))
    .map((key) => (path ? `${path}.${key}` : key))

  const missingInReference: string[] = targetKeys
    .filter((key) => !Object.prototype.hasOwnProperty.call(reference, key))
    .map((key) => (path ? `${path}.${key}` : key))

  const result = { missingInTarget, missingInReference }

  for (const key of refKeys) {
    const refValue = reference[key]
    const targetValue = target[key]

    if (
      Object.prototype.hasOwnProperty.call(target, key) &&
      typeof refValue === 'object' &&
      refValue !== null &&
      typeof targetValue === 'object' &&
      targetValue !== null
    ) {
      const subResult = compareTranslationKeys(
        refValue,
        targetValue,
        path ? `${path}.${key}` : key,
      )
      result.missingInTarget.push(...subResult.missingInTarget)
      result.missingInReference.push(...subResult.missingInReference)
    }
  }

  return result
}
