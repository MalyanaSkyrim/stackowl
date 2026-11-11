import { Logo } from '@/components/Logo'
import { repositoryUrl, site } from '@/lib/site'
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared'

/** The header both the landing page and the docs share: the owl, the name, GitHub. */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <Logo size={24} />
        {site.name}
      </span>
    ),
  },
  githubUrl: repositoryUrl,
}
