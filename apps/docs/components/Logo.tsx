/**
 * The SetupWise mark: a checklist, two set-up lines and a check, designed with Gemini.
 * The same shape is `app/icon.svg` (the tab icon) and `.github/logo.svg` (the README).
 */
export function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" aria-hidden>
      <path
        d="M112 40h80M64 104h80"
        fill="none"
        stroke="#4F46E5"
        strokeWidth="32"
        strokeLinecap="round"
      />
      <path
        d="M64 168l40 40 88-88"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="32"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
