import type { ReactNode } from 'react'

import { emailFont } from '../theme'

/** A padded card row; the body of every email is one or more of these. */
export function EmailSection({ children }: { children: ReactNode }) {
  return (
    <tr>
      <td style={{ padding: '32px 32px 36px', fontFamily: emailFont }}>
        {children}
      </td>
    </tr>
  )
}
