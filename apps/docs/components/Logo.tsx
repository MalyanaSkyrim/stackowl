/**
 * The SetupWise mark, one color: a check breaking out of an app's rounded square, designed with
 * Gemini. The same shape is `app/icon.svg` (the tab icon) and `.github/logo.svg` (the README).
 * It takes the text color (`currentColor`) when `color` is `current`, so it follows the theme.
 */
export function Logo({ size = 24, color = '#4F46E5' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" aria-hidden>
      <path
        d="M104 80H72a32 32 0 0 0-32 32v72a32 32 0 0 0 32 32h72a32 32 0 0 0 32-32v-32M88 120l24 24L216 40"
        fill="none"
        stroke={color === 'current' ? 'currentColor' : color}
        strokeWidth="32"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
