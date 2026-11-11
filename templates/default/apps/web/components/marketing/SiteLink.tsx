import { Link } from '@/i18n/routing'
import React from 'react'

// Typed from the i18n `Link`: next-intl 3 inlines React's anchor props from before
// React 19.2 (no `popover="hint"`), so the newer `<a>` props don't fit it.
type SiteLinkProps = Omit<React.ComponentProps<typeof Link>, 'href'> & {
  href: string
}

/**
 * A link that keeps the visitor's locale.
 *
 * Page paths go through the i18n `Link`, which adds the `/fr` prefix; a plain
 * anchor would drop a French visitor onto the English page. In-page anchors
 * (`#faq`, `#get-started`) stay plain so they scroll rather than navigate.
 */
export const SiteLink = ({ href, ...props }: SiteLinkProps) =>
  href.startsWith('#') ? (
    <a href={href} {...props} />
  ) : (
    <Link href={href} {...props} />
  )
