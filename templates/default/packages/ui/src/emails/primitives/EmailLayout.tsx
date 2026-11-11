import type { ReactNode } from 'react'

import { emailBrand, emailColors, emailFont } from '../theme'

/**
 * Filler after the preheader so clients don't pull the first lines of the body
 * into the inbox preview.
 */
const PREHEADER_FILLER = '‌ '.repeat(90)

type EmailLayoutProps = {
  lang: string
  /** Document title; use the email subject. */
  title: string
  /** Inbox preview line shown next to the subject. */
  preheader: string
  /** Why the recipient gets this email, shown in the footer. */
  footerNote: string
  children: ReactNode
}

/** Page shell shared by every email: head, preheader, card with logo header, and footer. */
export function EmailLayout({
  lang,
  title,
  preheader,
  footerNote,
  children,
}: EmailLayoutProps) {
  return (
    <html lang={lang}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <title>{title}</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          width: '100%',
          backgroundColor: emailColors.page,
          fontFamily: emailFont,
          WebkitTextSizeAdjust: '100%',
        }}>
        <div
          style={{
            display: 'none',
            maxHeight: 0,
            maxWidth: 0,
            overflow: 'hidden',
            opacity: 0,
            fontSize: 1,
            lineHeight: '1px',
            color: emailColors.page,
          }}>
          {preheader}
          {PREHEADER_FILLER}
        </div>

        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          border={0}
          bgcolor={emailColors.page}
          style={{ backgroundColor: emailColors.page }}>
          <tbody>
            <tr>
              <td align="center" style={{ padding: '32px 12px 40px' }}>
                <table
                  role="presentation"
                  align="center"
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  border={0}
                  bgcolor={emailColors.white}
                  style={{
                    maxWidth: 600,
                    backgroundColor: emailColors.white,
                    border: `1px solid ${emailColors.border}`,
                    borderRadius: 16,
                    borderCollapse: 'separate',
                    overflow: 'hidden',
                  }}>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          padding: '22px 32px',
                          borderBottom: `1px solid ${emailColors.border}`,
                        }}>
                        <EmailBrandMark size={40} />
                      </td>
                    </tr>
                    {children}
                  </tbody>
                </table>

                <EmailFooter note={footerNote} />
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}

/** Logo PNG plus the name as live text, so the brand still reads with images off. */
function EmailBrandMark({ size }: { size: number }) {
  return (
    <table role="presentation" cellPadding={0} cellSpacing={0} border={0}>
      <tbody>
        <tr>
          <td valign="middle" width={size}>
            <img
              src={emailBrand.logoUrl}
              width={size}
              height={size}
              // The name sits next to it as text; a non-empty alt would repeat it when images are blocked.
              alt=""
              style={{
                display: 'block',
                border: 0,
                outline: 'none',
                borderRadius: Math.round(size / 4.5),
              }}
            />
          </td>
          <td
            valign="middle"
            style={{
              paddingLeft: 12,
              fontFamily: emailFont,
              fontSize: 19,
              fontWeight: 700,
              letterSpacing: '-0.2px',
              color: emailColors.ink,
            }}>
            {emailBrand.name}
          </td>
        </tr>
      </tbody>
    </table>
  )
}

function EmailFooter({ note }: { note: string }) {
  return (
    <table
      role="presentation"
      align="center"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      style={{ maxWidth: 600 }}>
      <tbody>
        <tr>
          <td
            align="center"
            style={{
              padding: '28px 24px 0',
              fontFamily: emailFont,
              fontSize: 12,
              lineHeight: '18px',
              color: emailColors.muted,
            }}>
            <img
              src={emailBrand.logoUrl}
              width={24}
              height={24}
              alt=""
              style={{
                display: 'block',
                margin: '0 auto 12px',
                border: 0,
                borderRadius: 6,
              }}
            />
            <p style={{ margin: '0 0 6px' }}>{note}</p>
            <p style={{ margin: 0 }}>
              © {new Date().getFullYear()} {emailBrand.name}
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  )
}
