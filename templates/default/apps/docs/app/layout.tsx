import { site } from '@/lib/site'
import { RootProvider } from 'fumadocs-ui/provider'
import 'fumadocs-ui/style.css'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './global.css'

export const metadata: Metadata = {
  title: { template: `%s | ${site.name}`, default: site.name },
  description: site.description,
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  )
}
