import type { ReactNode } from 'react'

import { emailColors, emailFont } from '../theme'

const variants = {
  primary: emailColors.primary,
  dark: emailColors.ink,
} as const

type EmailButtonProps = {
  href: string
  variant?: keyof typeof variants
  children: ReactNode
}

/**
 * "Bulletproof" button: a padded link inside a coloured cell, no images, so it
 * stays visible and clickable when the client blocks images. Outlook ignores
 * the link padding; the cell height keeps the button's shape there.
 */
export function EmailButton({
  href,
  variant = 'primary',
  children,
}: EmailButtonProps) {
  const background = variants[variant]

  return (
    <table
      role="presentation"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      bgcolor={background}
      style={{
        backgroundColor: background,
        borderRadius: 12,
        borderCollapse: 'separate',
      }}>
      <tbody>
        <tr>
          <td
            align="center"
            valign="middle"
            height={48}
            style={{ borderRadius: 12 }}>
            <a
              href={href}
              style={{
                display: 'inline-block',
                padding: '14px 26px',
                borderRadius: 12,
                fontFamily: emailFont,
                fontSize: 16,
                fontWeight: 700,
                lineHeight: '20px',
                color: emailColors.white,
                textDecoration: 'none',
              }}>
              {children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

/** Two-line store label ("Download on the" / "App Store") for a dark `EmailButton`. */
export function EmailStoreLabel({
  caption,
  store,
}: {
  caption: string
  store: string
}) {
  return (
    <>
      <span
        style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 500,
          lineHeight: '14px',
          color: emailColors.heroSubtitle,
        }}>
        {caption}
      </span>
      <span style={{ display: 'block', fontSize: 17, lineHeight: '22px' }}>
        {store}
      </span>
    </>
  )
}
