/**
 * The site's destinations, shared by the navbar and the footer so every page
 * offers the same way around. `key` is a `nav.*` / `footer.*` translation key.
 *
 * "How it works" points at the home page's section from everywhere, so the
 * link lands in the same place whichever page the visitor is on.
 */
export const navLinks = [
  { key: 'howItWorks', href: '/#how-it-works' },
  { key: 'privacy', href: '/privacy' },
  { key: 'support', href: '/support' },
] as const

export const footerLinks = [
  { key: 'privacy', href: '/privacy' },
  { key: 'terms', href: '/terms' },
  { key: 'support', href: '/support' },
] as const

export interface SiteNavLink {
  label: string
  href: string
}
