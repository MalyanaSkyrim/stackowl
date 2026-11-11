import { emailColors } from '../theme'

type EmailLinkFallbackProps = {
  label: string
  href: string
}

/**
 * The raw URL under a button, for links that company link scanners may
 * rewrite or that the reader wants to open on another device.
 */
export function EmailLinkFallback({ label, href }: EmailLinkFallbackProps) {
  return (
    <p
      style={{
        margin: '20px 0',
        fontSize: 13,
        lineHeight: '20px',
        color: emailColors.muted,
      }}>
      {label}
      <br />
      <a
        href={href}
        style={{ color: emailColors.primary, wordBreak: 'break-all' }}>
        {href}
      </a>
    </p>
  )
}
