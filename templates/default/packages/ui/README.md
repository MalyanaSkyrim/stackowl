# @starter/ui

The universal UI kit. Every component is written once in React Native, styled with NativeWind classes, and used by both apps: `apps/mobile` renders it natively, and `apps/web` renders it in the browser through react-native-web. The components follow [react-native-reusables](https://github.com/mrzachnugent/react-native-reusables) (shadcn naming, `@rn-primitives` underneath).

```tsx
import { Button, Text } from '@starter/ui'

;<Button size="lg" loading={isSaving} onPress={save}>
  <Text>Save</Text>
</Button>
```

Browse every component in the Workshop: `pnpm workshop` (see `apps/workshop`).

## Rules

- **One component for web and mobile.** Never add a web-only or native-only copy of a component. Where a native library has no web support, add an `index.web.tsx` file in the component's folder that keeps the same props (see `BottomSheet/index.web.tsx`). Metro picks the shared file and the web bundlers pick the `.web` one.
- **No DOM.** `packages/ui/src` can't use DOM tags (`div`, `span`, `button`, `img`…) or `react-dom`. Use `View`, `Text`, `Pressable`, `TextInput`, `ScrollView`, react-native-svg and the kit's own components. `pnpm --filter=@starter/ui lint` fails on a violation. The only exemption is `src/emails`, the React Email kit, which renders HTML for mail clients.
- **Tokens, not hex.** Colors, radii, type scale and shadows come from `@starter/design-tokens`, so use classes like `bg-primary`, `text-muted-foreground` and `border-border`. When a value is needed in JS (SVG fills, third-party style props), use `useTokenColor()`.
- **Check the kit first.** Reuse or extend an existing component before adding a new one, and agree on new components with the team.

## Layout

```
src/
├── components/      # the kit: one folder per component (<Name>/index.tsx + <Name>/<Name>.stories.tsx)
├── lib/
│   ├── utils.ts         # cn() (classMerge is the old name)
│   └── token-colors.ts  # tokenColor(), useTokenColor(), useThemeScheme()
├── emails/          # React Email kit (web/server only)
├── styles/          # globals.css for apps/web
└── index.ts         # the public exports
```

## Adding a component

1. Create `src/components/<Name>/index.tsx` (the folder is named exactly after the component) with `'use client'` at the top (Next.js server components can render it then). Build it from React Native primitives or `@rn-primitives/*`, with `cn()` for classes. Text-bearing parents (like `Button`) pass text classes down through `TextClassContext`.
2. Export it from `src/index.ts`.
3. Add `src/components/<Name>/<Name>.stories.tsx` in the same folder (below). It shows up in the Workshop and in the on-device Storybook.
4. If it pulls in a React Native package that ships raw JSX or Flow, add that package to `transpilePackages` in `apps/web/next.config.mjs` and to `MODULES_TO_TRANSPILE` in `apps/workshop/.storybook/main.ts`. Native modules also go in `apps/mobile/package.json` so Expo links them.

## Adding a story

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'

import { Button } from './button'
import { Text } from './text'

const meta: Meta<typeof Button> = { title: 'Button', component: Button }
export default meta

type Story = StoryObj<typeof Button>

export const Default: Story = {
  render: () => (
    <Button>
      <Text>Button</Text>
    </Button>
  ),
}

// A render that uses hooks must be a named component.
export const Loading: Story = {
  render: function Render() {
    const [loading, setLoading] = React.useState(false)
    return (
      <Button loading={loading} onPress={() => setLoading(true)}>
        <Text>Save</Text>
      </Button>
    )
  },
}
```

Stories use only kit components and React Native primitives, so the same file runs in the browser Workshop and on a phone.

## App setup

The apps mount the kit's providers once at the root:

- `ThemeProvider` applies the token CSS variables for light or dark (native).
- `PortalHost` is where dialogs, popovers and selects render.
- `BottomSheetProvider` hosts bottom sheets (native).
- `Toaster` shows `toast()` messages.

`apps/web` loads `@starter/ui/globals.css` (Tailwind and the token variables) and keeps NativeWind's color scheme on the page theme (see `apps/web/components/providers.tsx`).
