---
title: 'UI'
description: 'The rules for components, styling and stories.'
---

How the kit works is explained in [UI kit](../architecture/ui-kit.md). These are the rules.

## One component for web and mobile

- These rules cover the product: `apps/mobile`, `apps/web` and `apps/workshop`. The docs site (`apps/docs`) is a team tool built from Fumadocs' own components ([Apps](../architecture/apps.md#docs-appsdocs)).
- All UI comes from `@starter/ui` (`packages/ui`). Both apps import the same component.
- Never add a web-only or native-only copy of a component.
- When a native library has no web support, add an `index.web.tsx` file in the component's folder with **the same props** (see `BottomSheet/index.web.tsx`).

## No HTML in the kit

`packages/ui/src` cannot use DOM elements (`div`, `span`, `button`, `img`…) or `react-dom`. Use `View`, `Text`, `Pressable`, `TextInput`, `ScrollView`, react-native-svg and kit components. `pnpm --filter=@starter/ui lint` fails otherwise. The React Email templates in `src/emails` are the only exception.

## Reuse before adding

Look in the Workshop (`pnpm workshop`) first. Extend an existing component rather than adding a close copy. A component that does not exist yet is agreed with the team before it is built.

Use kit components directly; don't wrap one only to fix a prop. A `ContinueButton` that renders `<Button size="lg"><Text>{label}</Text></Button>` is a second way to draw the same button, and it hides the kit's other props (`loading`, `variant`). A wrapper earns its place only when it adds behavior or markup.

## Icon buttons

An icon-only button is the kit `Button` with `variant="ghost" size="icon"` (44px, no background, a light circle while pressed) and a kit `Icon` inside:

```tsx
<Button
  variant="ghost"
  size="icon"
  accessibilityLabel={t('close')}
  onPress={onClose}>
  <Icon as={X} size={20} className="text-foreground" />
</Button>
```

Never put a raw lucide icon inside a `Pressable`. On iOS a drawn SVG shape takes the touch itself, so a tap on the icon's lines never reaches the button. The kit `Icon` sets `pointerEvents="none"` for this; if a raw icon is unavoidable, give it (or a wrapping `View`) `pointerEvents="none"`.

## Right to left

Arabic is right to left. Picking it flips the layout after a reload; text reads right to left only through the kit `Text`.

- Use `Text` from `@starter/ui`, never React Native's `Text`: on iOS it stays left-aligned in Arabic.
- Use start/end classes (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `border-s`, `rounded-e`…), not left/right ones. Don't add `text-left`/`text-right` or a `flex-row-reverse` to fake the flip.
- Icons that point somewhere (back, forward, chevrons) are picked from `I18nManager.isRTL`; icons that don't point never flip.
- Emails, phone numbers and codes stay left to right (`<Text script="latin">`).
- Check every new screen in Arabic.

The full rules and a checklist are in the [`arabic-rtl`](https://github.com/your-github-user/starter-app/blob/main/.claude/skills/arabic-rtl/SKILL.md) skill.

## Every component has a story

Each component has its own folder, named exactly after it: `<Name>/index.tsx` holds the component and `<Name>/<Name>.stories.tsx` its story. It uses only kit components and React Native primitives, so the same story runs in the browser Workshop and on a phone. A story whose `render` uses hooks must be a named function.

## File names

A component's file is named after the component, in PascalCase: `SignIn.tsx`, `EmailAuthForm.tsx`, never `sign-in.tsx` or `emailAuthForm.tsx`. A kit component is a folder with the same name (`Button/index.tsx`, `Button/Button.stories.tsx`).

Route files are the exception, because the router reads their names: in `apps/mobile/app/` (expo-router) the file name is the screen's URL (`sign-in.tsx`, `verify-email.tsx`) or a reserved name (`_layout.tsx`, `index.tsx`, `+not-found.tsx`), and in `apps/web/app/` Next.js needs `page.tsx` and `layout.tsx`. Hooks and other modules that aren't components stay camelCase (`useAuth.ts`, `device.ts`).

## Colors and design tokens

- Use token classes: `bg-primary`, `text-muted-foreground`, `border-border`, and so on.
- When a value is needed in code (SVG fills, third-party props), use `useTokenColor()`. It follows the theme the kit `ThemeProvider` applies.
- Don't use `dark:` classes in the app. The iOS app is pinned to light mode in Info.plist, so NativeWind always reports "light" there. Token classes and `useTokenColor()` switch with the Settings theme; when code must branch on light or dark, use `useThemeScheme()`.
- Dark mode is the `dark` palette in `tokens.ts`, with text kept at 4.5:1 or more.
- Never write a hex value. Change colors, radii, spacing or fonts in `packages/design-tokens/src/tokens.ts`, then run `pnpm --filter=@starter/design-tokens generate`.

## Look and feel

The starter has a neutral look: zinc greys with an indigo primary, flat white cards on a 1px border. Change it in `tokens.ts` to your brand's.

- **Color:** text is `text-foreground`, body copy `text-foreground-soft`, secondary text `text-muted-foreground`. The page is `bg-background`, cards `bg-card`, outlines `border-border` and `border-input`. The brand color (`bg-primary`) is the main action, selection and focus; `bg-secondary` is its light tint. Filled surfaces (the kit's filled `Button`, hero cards) use `bg-hero` with `text-hero-foreground`: the same as primary in light mode, a deeper shade in dark mode, where the bright primary glows as a fill. `bg-gold` is a highlight for badges and progress, a fill only. `bg-destructive` (with `bg-destructive-soft`) is for errors and deleting.
- **Fonts:** `font-sans` (IBM Plex Sans) for English and French UI, `font-arabic` (IBM Plex Sans Arabic) for Arabic UI, `font-display` and `font-display-ar` for headlines (IBM Plex SemiBold in the starter). On native every weight is its own family, so the kit's `Text` turns `font-medium` / `font-semibold` into the matching family and, under `TextScriptProvider script="arabic"` (mounted by the mobile i18n provider), switches UI copy to the Arabic font. Use the kit's `Text`, never React Native's `Text`, so this works.
- **Type:** `text-display`, `text-title-lg` / `-md` / `-sm` / `-xs`, `text-body-lg` / `-md` / `-sm`, `text-caption`, `text-tiny`, `text-label` / `-label-sm` for buttons, `text-kicker` for small uppercase labels. Prefer the `Text` variants (`display`, `h1`–`h4`, `p`, `lead`, `small`, `muted`, `caption`, `kicker`). Arabic headlines need a taller line, so in Arabic the kit's `Text` swaps `text-display`, `text-title-lg` and `text-title-md` for their `-ar` sizes by itself.
- **Corners:** `rounded-input` (14px) for inputs, chips and 48px buttons, `rounded-segment` (10px) for the selected segment inside a `rounded-input` control with 4px padding (so the two corners run parallel), `rounded-btn` (16px) for the 56px call to action, `rounded-card` (18px), `rounded-card-lg` (22px), `rounded-sheet` (24px) for dialogs and sheets.
- **Elevation:** the design is flat. `shadow-elevation-1` to `shadow-elevation-3` are only for floating things: toasts, dialogs and sheets use 3.
- **Spacing:** Tailwind's 4px scale; `px-gutter` (20px) for screen side padding.
- **Headers:** the screen title and everything beside it (back or close button, badges, icon buttons, step bars) sit in one header `View` above the screen's `ScrollView`, never inside it, so they stay put while the content scrolls. The header uses the same side padding as the scroll, and its bottom padding replaces the scroll's top padding.
- **Direction:** write `start` / `end` (`ps-4`, `ms-2`), not `left` / `right`, so screens flip in Arabic.

`cn()` knows these token names, so `cn('rounded-btn', 'rounded-full')` and `cn('text-title-lg', 'text-muted-foreground')` merge as expected.

Every color comes from `tokens.ts`: the web CSS, the phone theme, `useTokenColor()` and the email templates all read it. The one exception is the app icon and splash background in `apps/mobile/app.config.js`, which has to match the icon images and is changed together with them.

## Text

No text is written directly in a component. Every string goes in the locale files, in every language: `apps/web/locales/en.json` and `fr.json`; on mobile, `apps/mobile/src/lib/i18n/messages/` in English, French and Arabic.

Never leave a message empty (`""`): react-intl treats it as missing and shows the key on screen. When a line has no place in one language, leave it out in code. The mobile `translations.test.ts` fails on empty messages.

The phone runs Hermes, which has only part of `Intl` (no `PluralRules`, `Locale`, `RelativeTimeFormat`, `ListFormat`…), while the tests run in Node, which has it all. An ICU `plural` message or a new `Intl` API works on the phone only once `apps/mobile/src/lib/i18n/polyfills.ts` polyfills it, along with whatever its dependencies need (the plural rules need `Intl.Locale`), with data for every language. Its test imports `hermesIntl.ts` first, so it runs against Hermes's `Intl` rather than Node's, and tries regional tags such as `fr-MA` (see `plurals.test.ts`).

## Adding a component

1. Create `packages/ui/src/components/<Name>/index.tsx` with `'use client'` at the top. Build it from React Native primitives or `@rn-primitives/*`, with `cn()` for classes.
2. Export it from `packages/ui/src/index.ts`.
3. Add `<Name>.stories.tsx` in the same folder.
4. If it uses a React Native package that ships raw JSX or Flow, add the package to `transpilePackages` in `apps/web/next.config.mjs` and `MODULES_TO_TRANSPILE` in `apps/workshop/.storybook/main.ts`. Native modules also go in `apps/mobile/package.json`.

The full guide is `packages/ui/README.md`.
