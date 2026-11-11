---
title: 'UI kit'
description: 'One set of components for the web and the mobile app, and the Workshop to browse them.'
---

All UI lives in one package, `@starter/ui` (`packages/ui`). A component is written once, reviewed once and themed once, and both apps use it.

## How one component runs everywhere

Components are written in **React Native** and styled with **NativeWind** (Tailwind classes for React Native). They follow [react-native-reusables](https://github.com/mrzachnugent/react-native-reusables): shadcn/ui names and behavior, built on `@rn-primitives`.

- The **mobile app** renders them natively, as real iOS and Android views.
- The **web app** renders the same components in the browser through **react-native-web**, which turns `View` into a `div`, `Text` into a `span`, and so on.

```tsx
import { Button, Text } from '@starter/ui'

;<Button size="lg" loading={isSaving} onPress={save}>
  <Text>Save</Text>
</Button>
```

When a native library has no web version (bottom sheets, maps), the component gets a second file with the same props, `<name>.web.tsx`. The phone build picks the normal file and the web build picks the `.web` one. Either way, the app imports one component.

## The rules

- **One component for web and mobile.** Never add a web-only or mobile-only copy.
- **No HTML in the kit.** No `div`, `span`, `button` or `react-dom` inside `packages/ui/src`; lint fails if there is. The email templates (`src/emails`) are the only exception.
- **Colors from tokens.** Classes such as `bg-primary` or `text-muted-foreground`; `useTokenColor()` when a value is needed in code. Never a hex value.
- **Reuse first.** Check the Workshop before adding anything. New components are agreed with the team.
- **Every component has a story.**

Details: [UI conventions](../conventions/ui.md).

## What is in the kit

Only what the Starter App screens and the website use: Accordion (website FAQ), AppLogo, BottomSheet, Button, Card, Dialog, Form, Icon, Input, Label, MenuList, OtpInput, ProgressBar, RadioGroup, Skeleton, Switch, Text, Textarea, Toast and ToggleGroup. The Workshop always has the current list.

## The Workshop

```sh
pnpm workshop
```

Opens a Storybook on http://localhost:6006 with every component and its variants, light and dark. It loads every `*.stories.tsx` file in the component folders, so a story added once shows there. CI builds it on every pull request.

## Theme and tokens

`packages/design-tokens/src/tokens.ts` holds the colors, radii, spacing, fonts and shadows. From it come the Tailwind preset both apps use, the CSS variables for the web (light and dark, written to `tokens.css` by the generator) and the theme for the phone. The kit's `ThemeProvider`, mounted once in each app, switches between light and dark.

[UI conventions](../conventions/ui.md) lists the tokens. The mobile app loads the fonts with expo-font (`apps/mobile/lib/hooks/useAppFonts.ts`) and the Workshop registers the same files (`apps/workshop/.storybook/fonts.ts`).
