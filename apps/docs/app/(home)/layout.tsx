import { baseOptions } from '@/lib/layout'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout {...baseOptions} links={[{ text: 'Docs', url: '/docs' }]}>
      {children}
    </HomeLayout>
  )
}
