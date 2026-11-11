# Workshop

One Storybook for the universal kit (`@starter/ui`). It runs the kit's React Native components in the browser through react-native-web (Storybook 10, `@storybook/react-native-web-vite`), so what you see here is what both apps render.

```sh
pnpm workshop          # dev server on http://localhost:6006 (same as pnpm storybook)
pnpm storybook:build   # static build into apps/workshop/storybook-static (CI runs this)
```

The same stories run on a phone through the on-device Storybook in the Expo app: `pnpm --filter=@starter/mobile storybook` (or `storybook:ios`).

## What it loads

- **Stories:** every `*.stories.tsx` under `packages/ui/src/components`, grouped under "UI". Add a story in a component's folder and it appears in both Storybooks.
- **Styles:** `@starter/ui/globals.css` (Tailwind and the design-token variables), built with `tailwind.config.ts` (the kit's config plus NativeWind's preset).
- **Providers:** `.storybook/preview.tsx` wraps each story in the kit's `ThemeProvider` and `PortalHost`. The toolbar's light/dark switch drives both the CSS variables and NativeWind's color scheme.

## Config notes (`.storybook/main.ts`)

- `MODULES_TO_TRANSPILE` lists React Native packages that ship raw JSX or Flow. Add a package there when a new component depends on one and the build fails to parse it.
- A small plugin rewrites the one JSX expression in `react-native-css-interop/dist/doctor.js`, and `build.commonjsOptions.transformMixedEsModules` is on. Without them the static build fails with `exports is not defined` / `require is not defined`, although dev mode works.
