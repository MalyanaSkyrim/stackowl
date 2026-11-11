import { Logo } from '@/components/Logo'
import { repositoryUrl, site } from '@/lib/site'
import { source } from '@/lib/source'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Logo size={24} />
            {site.name}
          </span>
        ),
      }}
      githubUrl={repositoryUrl}
    >
      {children}
    </DocsLayout>
  )
}
