import { describe, expect, test } from 'vitest'

import { secondsUntilNextOtp } from './otp'

const now = new Date('2026-10-21T12:00:00Z')
const secondsAgo = (seconds: number) => new Date(now.getTime() - seconds * 1000)

describe('secondsUntilNextOtp', () => {
  test('sends the first code right away', () => {
    expect(secondsUntilNextOtp([], now)).toBe(0)
  })

  test('waits a minute after the last code', () => {
    expect(secondsUntilNextOtp([secondsAgo(20)], now)).toBe(40)
    expect(secondsUntilNextOtp([secondsAgo(60)], now)).toBe(0)
  })

  test('waits for the oldest code to age out at five codes an hour', () => {
    const codes = [120, 600, 1200, 1800, 3000].map(secondsAgo)
    expect(secondsUntilNextOtp(codes, now)).toBe(600)
  })

  test('sends again under the hourly cap', () => {
    const codes = [120, 600, 1200, 1800].map(secondsAgo)
    expect(secondsUntilNextOtp(codes, now)).toBe(0)
  })
})
