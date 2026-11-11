import { source } from '@/lib/source'
import { createFromSource } from 'fumadocs-core/search/server'

// The search index, written once at build time: the browser downloads it and searches it
// itself, so the site needs no server (GitHub Pages).
export const revalidate = false

export const { staticGET: GET } = createFromSource(source)
