const SENSITIVE_KEY_PATTERN = /password|token|secret|apikey|dataBase64/i

const DEFAULT_MAX_STRING_LENGTH = 256
const DEFAULT_MAX_TOTAL_LENGTH = 2000

export interface StringifyForLogOptions {
  maxStringLength?: number
  maxTotalLength?: number
}

const sanitize = (value: unknown, maxStringLength: number): unknown => {
  if (typeof value === 'string') {
    return value.length > maxStringLength
      ? `<string: ${value.length} chars>`
      : value
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item, maxStringLength))
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key)
          ? '[redacted]'
          : sanitize(entry, maxStringLength),
      ]),
    )
  }

  return value
}

/**
 * Serializes a value for logging without leaking secrets or dumping large
 * payloads (base64 uploads, long blobs) into the logs.
 *
 * Keys matching {@link SENSITIVE_KEY_PATTERN} are redacted, oversized strings
 * are replaced by their length, and the final output is capped.
 */
export const stringifyForLog = (
  value: unknown,
  options: StringifyForLogOptions = {},
): string => {
  const {
    maxStringLength = DEFAULT_MAX_STRING_LENGTH,
    maxTotalLength = DEFAULT_MAX_TOTAL_LENGTH,
  } = options

  let serialized: string
  try {
    serialized = JSON.stringify(sanitize(value, maxStringLength)) ?? 'undefined'
  } catch {
    return '<unserializable>'
  }

  return serialized.length > maxTotalLength
    ? `${serialized.slice(0, maxTotalLength)}…(truncated)`
    : serialized
}
