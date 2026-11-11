import { emailBrand, emailColors, emailFont } from '../theme'

type EmailHeroProps = {
  eyebrow: string
  title: string
  subtitle: string
}

/**
 * Indigo band under the header, over a hero photo. The overlay is baked into
 * the image so one `url()` layer is enough; the solid `bgcolor` shows where
 * background images are dropped (Outlook for Windows, images blocked).
 */
export function EmailHero({ eyebrow, title, subtitle }: EmailHeroProps) {
  return (
    <tr>
      <td style={{ padding: 0 }}>
        <table
          role="presentation"
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          border={0}
          bgcolor={emailColors.primary}
          style={{
            backgroundColor: emailColors.primary,
            backgroundImage: `url(${emailBrand.heroImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}>
          <tbody>
            <tr>
              <td style={{ padding: '48px 32px', fontFamily: emailFont }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '5px 12px',
                    borderRadius: 999,
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    backgroundColor: 'rgba(255, 255, 255, 0.14)',
                    fontSize: 11,
                    fontWeight: 700,
                    lineHeight: '14px',
                    letterSpacing: '1.2px',
                    textTransform: 'uppercase',
                    color: emailColors.white,
                  }}>
                  {eyebrow}
                </span>
                <h1
                  style={{
                    margin: '18px 0 10px',
                    fontSize: 28,
                    fontWeight: 800,
                    lineHeight: '34px',
                    letterSpacing: '-0.5px',
                    color: emailColors.white,
                  }}>
                  {title}
                </h1>
                <p
                  style={{
                    margin: 0,
                    fontSize: 16,
                    lineHeight: '24px',
                    color: emailColors.heroSubtitle,
                  }}>
                  {subtitle}
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
  )
}
