import type { ReactNode } from 'react'

import { emailColors } from '../theme'

const variants = {
  body: { fontSize: 16, lineHeight: '26px', color: emailColors.body },
  note: { fontSize: 13, lineHeight: '20px', color: emailColors.muted },
} as const

type EmailTextProps = {
  variant?: keyof typeof variants
  children: ReactNode
}

export function EmailText({ variant = 'body', children }: EmailTextProps) {
  return <p style={{ margin: '0 0 20px', ...variants[variant] }}>{children}</p>
}

/** Bold span for names and values inside `EmailText`. */
export function EmailStrong({ children }: { children: ReactNode }) {
  return (
    <strong style={{ fontWeight: 700, color: emailColors.ink }}>
      {children}
    </strong>
  )
}

/** Closing lines: a muted greeting and the team name in bold. */
export function EmailSignOff({
  greeting,
  signature,
}: {
  greeting: string
  signature: string
}) {
  return (
    <p
      style={{
        margin: '28px 0 0',
        fontSize: 15,
        lineHeight: '24px',
        color: emailColors.body,
      }}>
      {greeting}
      <br />
      <EmailStrong>{signature}</EmailStrong>
    </p>
  )
}
