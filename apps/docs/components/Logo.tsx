/**
 * The StackOwl mark: an owl whose eyes are a terminal prompt and a check mark, designed with
 * Gemini. The same shape is `app/icon.svg` (the tab icon) and `.github/logo.svg` (the README).
 */
const OWL = 'M 24,40 Q 128,110 232,40 C 232,150 196,230 128,230 C 60,230 24,150 24,40 Z M 76,96 L 60,112 L 80,132 L 60,152 L 76,168 L 112,132 Z M 172,168 L 216,124 L 200,108 L 172,136 L 162,126 L 146,142 Z M 116,148 L 128,164 L 140,148 Z'

export function Logo({ size = 24, color = '#4F46E5' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" aria-hidden>
      <path fill={color === 'current' ? 'currentColor' : color} fillRule="evenodd" d={OWL} />
    </svg>
  )
}
