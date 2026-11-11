import pino from 'pino'
import { describe, expect, test, vi } from 'vitest'

import { inFixedTime } from './fixedTime'

const log = pino({ level: 'error' }, { write: () => {} })

describe('inFixedTime', () => {
  test('waits the full time when the work is quicker', async () => {
    const start = Date.now()
    await inFixedTime(60, async () => {}, log)
    expect(Date.now() - start).toBeGreaterThanOrEqual(55)
  })

  test('logs a failure instead of throwing it, and still waits', async () => {
    const error = vi.spyOn(log, 'error')
    const start = Date.now()

    await expect(
      inFixedTime(
        60,
        async () => {
          throw new Error('Resend is down')
        },
        log,
      ),
    ).resolves.toBeUndefined()

    expect(error).toHaveBeenCalledOnce()
    expect(Date.now() - start).toBeGreaterThanOrEqual(55)
  })
})
