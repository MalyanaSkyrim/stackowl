import { describe, expect, it } from 'vitest'

import { collectAdParams } from './params'

describe('collectAdParams', () => {
  it('picks the ad parameters that are present', () => {
    const source = new URLSearchParams(
      'utm_source=facebook&utm_campaign=launch_q1&fbclid=abc123',
    )

    expect(collectAdParams(source)).toEqual({
      utm_source: 'facebook',
      utm_campaign: 'launch_q1',
      fbclid: 'abc123',
    })
  })

  it('leaves out absent and empty parameters', () => {
    const source = new URLSearchParams('utm_source=&utm_medium=cpc')

    expect(collectAdParams(source)).toEqual({ utm_medium: 'cpc' })
  })

  it('ignores keys we do not forward', () => {
    const source = new URLSearchParams('utm_source=ig&ref=newsletter')

    expect(collectAdParams(source)).toEqual({ utm_source: 'ig' })
  })

  it('reads a Next.js searchParams object, taking the first repeated value', () => {
    expect(
      collectAdParams({
        utm_source: ['facebook', 'instagram'],
        gclid: 'g-1',
        missing: undefined,
      }),
    ).toEqual({ utm_source: 'facebook', gclid: 'g-1' })
  })
})
