import { Link } from '@/i18n/routing'
import { brand } from '@starter/common'
import React from 'react'

type Chunks = React.ReactNode

const linkClass =
  'text-primary underline underline-offset-2 hover:text-primary-hover'

/**
 * Tags the legal and support copy uses inside its messages, for `t.rich`.
 * Each message only uses the tags it needs; unused ones are ignored.
 */
export const richTags = {
  strong: (chunks: Chunks) => (
    <strong className="text-foreground font-semibold">{chunks}</strong>
  ),
  eula: (chunks: Chunks) => (
    <a
      href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
      className={linkClass}>
      {chunks}
    </a>
  ),
  refund: (chunks: Chunks) => (
    <a href="https://reportaproblem.apple.com" className={linkClass}>
      {chunks}
    </a>
  ),
  privacy: (chunks: Chunks) => (
    <Link href="/privacy" className={linkClass}>
      {chunks}
    </Link>
  ),
}

/** A `<mail>` tag that writes to `address`; pass it with the matching `{email}` value. */
export const mailTo = (address: string) => {
  const MailTo = (chunks: Chunks) => (
    <a href={`mailto:${address}`} className={linkClass}>
      {chunks}
    </a>
  )
  return MailTo
}

/** Values every message may interpolate. */
export const brandValues = {
  app: brand.displayName,
  legalName: brand.legal.name,
  address: brand.legal.address,
}
