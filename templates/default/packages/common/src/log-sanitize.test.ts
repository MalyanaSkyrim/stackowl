import { describe, expect, it } from 'vitest'

import { stringifyForLog } from './log-sanitize'

describe('stringifyForLog', () => {
  it('redacts upload payloads instead of printing them', () => {
    const dataBase64 = 'A'.repeat(166_000)

    const output = stringifyForLog({
      fileName: 'receipt.png',
      mimeType: 'image/png',
      dataBase64,
    })

    expect(output).not.toContain(dataBase64)
    expect(output).toContain('"dataBase64":"[redacted]"')
    expect(output).toContain('"fileName":"receipt.png"')
  })

  it('redacts credentials by key name', () => {
    const output = stringifyForLog({
      email: 'user@example.com',
      password: 'hunter2',
      confirmPassword: 'hunter2',
      token: 'reset-token',
      apiKey: 'k-123',
    })

    expect(output).not.toContain('hunter2')
    expect(output).not.toContain('reset-token')
    expect(output).not.toContain('k-123')
    expect(output).toContain('"email":"user@example.com"')
  })

  it('collapses long non-sensitive strings to their length', () => {
    const output = stringifyForLog({ note: 'x'.repeat(300) })

    expect(output).toBe('{"note":"<string: 300 chars>"}')
  })

  it('leaves ordinary inputs untouched', () => {
    // cspell:ignore bcyk cmsw lojnox
    const input = {
      paymentId: 'cmsw8bcyk0000lojnox2s68t0',
      amount: 12_000,
      reference: null,
      tags: ['a', 'b'],
      nested: { planCode: 'PRO' },
    }

    expect(stringifyForLog(input)).toBe(JSON.stringify(input))
  })

  it('redacts sensitive keys nested in arrays and objects', () => {
    const output = stringifyForLog({
      files: [{ fileName: 'a.png', dataBase64: 'B'.repeat(5000) }],
    })

    expect(output).not.toContain('BBBB')
    expect(output).toContain('"dataBase64":"[redacted]"')
  })

  it('caps the total output length', () => {
    const output = stringifyForLog(
      { items: Array.from({ length: 500 }, (_, i) => ({ id: i })) },
      { maxTotalLength: 100 },
    )

    expect(output).toHaveLength(100 + '…(truncated)'.length)
    expect(output.endsWith('…(truncated)')).toBe(true)
  })

  it('returns a placeholder for unserializable values', () => {
    expect(stringifyForLog({ big: 1n })).toBe('<unserializable>')
  })
})
