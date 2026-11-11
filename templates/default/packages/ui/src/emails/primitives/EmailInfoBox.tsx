import { emailColors } from '../theme'

type EmailInfoBoxProps = {
  rows: { label: string; value: string }[]
}

/** Tinted key/value summary, e.g. the role and expiry of an invitation. */
export function EmailInfoBox({ rows }: EmailInfoBoxProps) {
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
        {rows.map((row, index) => {
          const cellStyle = {
            padding: '14px 20px',
            fontSize: 14,
            lineHeight: '20px',
            borderTop:
              index === 0 ? 'none' : `1px solid ${emailColors.primaryTint}`,
          }
          return (
            <tr key={row.label}>
              <td style={{ ...cellStyle, color: emailColors.body }}>
                {row.label}
              </td>
              <td
                align="right"
                style={{
                  ...cellStyle,
                  fontWeight: 700,
                  color: emailColors.ink,
                }}>
                {row.value}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
