import { site } from '@/lib/site'
import { RootProvider } from 'fumadocs-ui/provider'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import 'fumadocs-ui/style.css'
import './global.css'

export const metadata: Metadata = {
  title: { template: `%s | ${site.name}`, default: site.name },
  description: site.description,
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  )
}
