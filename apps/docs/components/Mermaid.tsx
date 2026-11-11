'use client'

import { useTheme } from 'next-themes'
import { useEffect, useId, useState } from 'react'

/**
 * A ```mermaid block, drawn in the browser with mermaid's own light or dark theme, following the
 * docs' theme toggle. `remarkMdxMermaid` turns each block into this component.
 */
export function Mermaid({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, '')
  const { resolvedTheme } = useTheme()
  const [svg, setSvg] = useState('')

  useEffect(() => {
    let cancelled = false
    void import('mermaid').then(async ({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        fontFamily: 'inherit',
        theme: resolvedTheme === 'dark' ? 'dark' : 'default',
      })
      const { svg: drawn } = await mermaid.render(`mermaid-${id}`, chart)
      if (!cancelled) setSvg(drawn)
    })
    return () => {
      cancelled = true
    }
  }, [chart, id, resolvedTheme])

  return (
    <div
      className="not-prose"
      style={{
        margin: '1.5rem 0',
        display: 'flex',
        justifyContent: 'center',
        overflowX: 'auto',
      }}
      // mermaid returns the diagram as SVG markup, drawn from the page's own text.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
