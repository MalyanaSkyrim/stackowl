/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // The app's own config, which spreads the shared `@starter/ui` one and adds
    // the marketing type/spacing scale on top. Pointing this at the UI package
    // directly — as an app-local config would — silently discards
    // everything in `apps/web/tailwind.config.ts`.
    tailwindcss: { config: './tailwind.config.ts' },
    autoprefixer: {},
  },
}

export default config
