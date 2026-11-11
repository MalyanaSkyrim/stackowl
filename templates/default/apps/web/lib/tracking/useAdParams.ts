'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { adParamKeys, collectAdParams, type AdParams } from './params'

const STORAGE_KEY = 'app.ad-params'

const readStored = (): AdParams => {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return {}

    // Re-validate: sessionStorage is writable by anything on the origin, so
    // only the keys we know about are let back in.
    const record = parsed as Record<string, unknown>
    const restored: AdParams = {}

    for (const key of adParamKeys) {
      const value = record[key]
      if (typeof value === 'string' && value) restored[key] = value
    }

    return restored
  } catch {
    // Private browsing, blocked site data or malformed JSON.
    return {}
  }
}

const writeStored = (params: AdParams) => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(params))
  } catch {
    // Storage is a convenience here, never a requirement.
  }
}

/**
 * The ad attribution for this visit.
 *
 * Visitors arrive from an in-app browser on `/?utm_source=…` and then
 * navigate within the site, which drops the query string. Persisting to
 * sessionStorage keeps the attribution attached to the lead they eventually
 * submit.
 *
 * The first render returns the URL parameters only, so the server and client
 * markup agree; anything restored from storage arrives after mount.
 */
export const useAdParams = (): AdParams => {
  const searchParams = useSearchParams()
  const fromUrl = collectAdParams(searchParams)
  const hasUrlParams = Object.keys(fromUrl).length > 0

  const [restored, setRestored] = useState<AdParams>({})

  useEffect(() => {
    if (hasUrlParams) {
      writeStored(fromUrl)
      return
    }

    setRestored(readStored())
    // `fromUrl` is rebuilt every render; the query string it derives from is
    // the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, hasUrlParams])

  return hasUrlParams ? fromUrl : restored
}
