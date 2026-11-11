---
title: 'Apps'
description: 'Each app in apps/, what it is for and how it is organized.'
---

Everything under `apps/` is something you can run.

| App             | Package             | Runs on               | Start it                                                         |
| --------------- | ------------------- | --------------------- | ---------------------------------------------------------------- |
| `apps/api`      | `@starter/api`      | http://localhost:4000 | `pnpm dev` (with the others)                                     |
| `apps/mobile`   | `@starter/mobile`   | Metro on port 8083    | `pnpm dev` (iOS), or `pnpm --filter=@starter/mobile dev:android` |
| `apps/web`      | `@starter/web`      | http://localhost:3003 | `pnpm dev` (with the others)                                     |
| `apps/workshop` | `@starter/workshop` | http://localhost:6006 | `pnpm workshop`                                                  |
| `apps/docs`     | `@starter/docs`     | http://localhost:3004 | `pnpm docs`                                                      |

## API (`apps/api`)

The backend for signed-in users: accounts and the notes example. A Fastify server with every module's tRPC router under `/trpc`, and `GET /health` for Cloud Run. It stores its data in CockroachDB through `@starter/database` (Prisma).

- `src/trpc/` sets up tRPC: the context (the signed-in user from the `Authorization: Bearer` access token, valid only while its session is live), `publicProcedure` / `protectedProcedure`, and `router.ts`, which joins the modules and exports the `AppRouter` type for the app's client.
- Each module has the same layout: `<module>.router.ts` (procedures) → `.handlers.ts` → `.services.ts` (the work and the database), with `.errors.ts` (one `AppError` class per failure, see `src/errors.ts`), `.test.ts`, and `.utils.ts` or `utils/`. Responses carry only data; a failure is an HTTP error with a reason. Details: the `add-api-feature-guide` skill.
- `src/modules/auth/`: accounts. In `utils/`: access tokens and refresh sessions (`tokens.ts`), passwords, 6-digit email codes for sign-up, sign-in and password reset (`otp.ts`, `email/`), Sign in with Apple and Google (`oauth/`) and account deletion (`account.ts`).
- `src/modules/notes/`: the notes example. `notes.list`, `get`, `create`, `update` and `delete`, each for the signed-in user only: a note of another user answers `NOT_FOUND`. Copy it for your first feature.
- `auth.router.ts` holds the account procedures: `signUp`, `logIn`, `requestOtp`, `verifyOtp`, `requestPasswordReset`, `resetPassword`, `oauthSignIn`, `refresh`, `logOut` and `me`. A failure the app explains carries a reason (`authErrorReasonSchema` in `@starter/common`) in the error's `data.reason`; `logIn` with an unconfirmed email fails with `EMAIL_NOT_VERIFIED` (403) and sends a new code.
- Environment variables: `API_PORT`, `API_URL`, `API_KEY`, `AUTH_SECRET`, `DATABASE_URL`, and the optional email and sign-in ones in `.env.example`. Without `RESEND_API_KEY` and `RESEND_FROM` in development, email codes are written to the API log instead of sent.
- Rate limiting (`src/plugins/rate-limit.ts`) counts requests per IP in the external Redis at `REDIS_URL`, so every Cloud Run instance shares the counts. Without it, each instance counts in memory. If Redis can't be reached, requests go through rather than fail.

## Mobile (`apps/mobile`)

The Starter App app. An Expo app with expo-router (file-based routes).

- `app/(home)/` holds the tabs: Notes (`index.tsx`, the example feature) and Settings (`profile.tsx`). `app/notes/[id].tsx` opens one note to edit (`new` for a new one), and `app/profile/` holds the settings screens (account, language, about).
- `app/auth/` holds the sign-in screens (sign in or create an account with Apple, Google or email, then the email code), shown as one modal. The Notes tab and Settings open it.
- The API client is `src/lib/api/`: a tRPC client (`client.ts`, which refreshes the session once when a call is refused for an expired access token) and its TanStack Query bindings (`trpc.ts`, `useTRPC()`). `EXPO_PUBLIC_API_URL` says where the API runs.
- App state is in Jotai atoms in `src/lib/store/`; settings are saved on the phone with expo-sqlite's key-value store. See [State and storage](state-and-storage.md).
- Text is in `src/lib/i18n/messages/` (English, French and Arabic, right to left). Picking Arabic calls `I18nManager.forceRTL` and reloads, which flips the layout; the kit `Text` sets the right-to-left text direction from `TextScriptProvider` (mounted in `src/lib/providers/I18nProvider.tsx`). Hermes lacks `Intl.Locale` and `Intl.PluralRules`, so `src/lib/i18n/polyfills.ts`, loaded first from `index.ts`, polyfills them for each app language.

How to build a mobile feature: the [`add-app-feature-guide`](https://github.com/your-github-user/starter-app/blob/main/.claude/skills/add-app-feature-guide/SKILL.md), [`react-native-component-layers`](https://github.com/your-github-user/starter-app/blob/main/.claude/skills/react-native-component-layers/SKILL.md), [`react-native-forms`](https://github.com/your-github-user/starter-app/blob/main/.claude/skills/react-native-forms/SKILL.md) and [`arabic-rtl`](https://github.com/your-github-user/starter-app/blob/main/.claude/skills/arabic-rtl/SKILL.md) skills.

## Web (`apps/web`)

A Next.js App Router app for the public website: the landing page, and the privacy policy, terms and support pages the App Store requires, in English and French.

- Routes live in `app/[locale]/`, one folder per page, with the locale in the address.
- Text comes from `locales/en.json` and `locales/fr.json` through next-intl.
- Every component comes from the UI kit, rendered with react-native-web. `components/Providers.tsx` mounts the kit's providers and keeps the theme in sync.
- Development runs on webpack (`next dev` without `--turbopack`) until Turbopack resolves react-native-web's `.web.js` files inside `node_modules`.

How to build a web feature: the [`add-web-feature-guide` skill](https://github.com/your-github-user/starter-app/blob/main/.claude/skills/add-web-feature-guide/SKILL.md).

## Workshop (`apps/workshop`)

A Storybook that shows every UI kit component in the browser, through react-native-web, with a light/dark switch. What you see there is what both apps render. See [UI kit](ui-kit.md).

## Docs (`apps/docs`)

This docs site, built with [Fumadocs](https://fumadocs.dev) on Next.js. Every page is Markdown in `apps/docs/content/`, one folder per section, with `meta.json` setting each section's order and title. A page starts with a `title` (and an optional `description`) in its front matter; the site prints them as the page heading.

- `.md` pages are plain Markdown and read the same on GitHub. `.mdx` pages can also use the site's components: `Steps`, `Tabs`, `Callout`, `Cards`, `Accordions`, `FlowDiagram` (an animated diagram with a walk-through), `Terminal` (a command typing out, with its real output) and ` ```mermaid ` blocks.
- Link pages by their file path (`../setup/5-cloud.mdx`), so links work on GitHub and on the site.
- It uses Fumadocs' default theme, light and dark. The site has no Tailwind of its own: its components style themselves with CSS modules and Fumadocs' color variables (`--color-fd-*`), so they follow the theme. Add your own rules in `app/global.css`.
- `pnpm --filter=@starter/docs build` checks every page compiles. Run it after changing a page's components.
