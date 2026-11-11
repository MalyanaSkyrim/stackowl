import { emailColors } from '../theme'

export type EmailFeature = {
  /** A text glyph (digit, ✓) — icon images disappear when images are blocked. */
  glyph: string
  title: string
  body: string
}

type EmailFeatureListProps = {
  title: string
  features: EmailFeature[]
}

export function EmailFeatureList({ title, features }: EmailFeatureListProps) {
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      bgcolor={emailColors.panel}
      style={{
        margin: '4px 0 28px',
        backgroundColor: emailColors.panel,
        border: `1px solid ${emailColors.primaryTint}`,
        borderRadius: 14,
        borderCollapse: 'separate',
      }}>
      <tbody>
        <tr>
          <td style={{ padding: '22px 22px 6px' }}>
            <p
              style={{
                margin: '0 0 16px',
                fontSize: 12,
                fontWeight: 700,
                lineHeight: '16px',
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                color: emailColors.primary,
              }}>
              {title}
            </p>
            {features.map((feature) => (
              <table
                key={feature.title}
                role="presentation"
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                border={0}
                style={{ marginBottom: 16 }}>
                <tbody>
                  <tr>
                    <td valign="top" width={36}>
                      <table
                        role="presentation"
                        cellPadding={0}
                        cellSpacing={0}
                        border={0}
                        bgcolor={emailColors.primaryTint}
                        style={{
                          backgroundColor: emailColors.primaryTint,
                          borderRadius: 10,
                          borderCollapse: 'separate',
                        }}>
                        <tbody>
                          <tr>
                            <td
                              align="center"
                              valign="middle"
                              width={36}
                              height={36}
                              style={{
                                fontSize: 15,
                                fontWeight: 800,
                                lineHeight: '36px',
                                color: emailColors.primary,
                              }}>
                              {feature.glyph}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                    <td valign="top" style={{ paddingLeft: 14 }}>
                      <p
                        style={{
                          margin: '0 0 2px',
                          fontSize: 15,
                          fontWeight: 700,
                          lineHeight: '22px',
                          color: emailColors.ink,
                        }}>
                        {feature.title}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 14,
                          lineHeight: '21px',
                          color: emailColors.body,
                        }}>
                        {feature.body}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            ))}
          </td>
        </tr>
      </tbody>
    </table>
  )
}
