# Agent Rules — starter-app

Rules all AI agents must follow when working in this repository.

This repo holds Starter App: an iPhone app (Expo), an API (Fastify + tRPC), a website for the landing page and legal pages, and one universal UI kit the app and the website share. It was created with `setupwise create`; the notes feature is the example every layer is built around. See `README.md` for the layout, and the docs site (`apps/docs`, `pnpm docs`) for setup, architecture and coding conventions.

---

## Monorepo — pnpm Workspaces

This is a **pnpm monorepo** orchestrated with Turborepo. Always use the `--filter` flag to run scripts in a specific workspace instead of `cd`-ing into the package directory.

```sh
# Run a script in a specific app or package
pnpm --filter=@starter/<package-or-app-name> <script>

# Examples
pnpm typecheck --filter=@starter/mobile
pnpm build --filter=@starter/web
pnpm test --filter=@starter/common
```

Package names follow the `@starter/<name>` convention and match the `name` field in each `package.json`.

| Workspace                | Name                     | What it is                                                         |
| ------------------------ | ------------------------ | ------------------------------------------------------------------ |
| `apps/api`               | `@starter/api`           | API: accounts and the notes example (Fastify + tRPC, Prisma)       |
| `apps/mobile`            | `@starter/mobile`        | The Starter App app: Expo / React Native (expo-router, NativeWind) |
| `apps/web`               | `@starter/web`           | Next.js website: landing page, privacy policy, terms               |
| `apps/workshop`          | `@starter/workshop`      | Workshop: browser Storybook (react-native-web)                     |
| `apps/docs`              | `@starter/docs`          | Docs site (Fumadocs): setup step by step, reference, architecture  |
| `packages/ui`            | `@starter/ui`            | Universal UI kit (React Native + NativeWind), email kit            |
| `packages/design-tokens` | `@starter/design-tokens` | Shared tokens, Tailwind preset, CSS + native theme                 |
| `packages/common`        | `@starter/common`        | Shared zod schemas, models, brand and utilities                    |
| `packages/database`      | `@starter/database`      | Prisma schema and database client                                  |
| `packages/config`        | `@starter/config`        | Shared ESLint, Prettier and TypeScript configs                     |

> **Always check the `scripts` field of the relevant `package.json` before running a command** — not every package has `build`, `test`, `typecheck`, etc.

---

## Skills

Task-specific guides live in `.claude/skills/<name>/SKILL.md`, where Claude Code loads them. Read the matching skill before starting:

- `add-web-feature-guide` — features in `apps/web`
- `add-app-feature-guide` — features in `apps/mobile`
- `add-api-feature-guide` — procedures, modules and routes in `apps/api`
- `react-native-component-layers` — how mobile components are layered
- `react-native-forms` — forms in the mobile app
- `arabic-rtl` — keeping screens and components right in Arabic (right to left)
- Prisma's own skills can be added with `npx skills add prisma/skills`; our database rules below still apply (never write migrations).

---

## Git

- **Branch names start with `feature/` or `hotfix/`**, by the type of change: `feature/` for new work (features, refactors, docs, chores), `hotfix/` for a fix to something already shipped. Then the issue number, if there is one, and a few words in kebab-case: `feature/12-forgot-password`. Never start a branch with a name or username (`<username>/…`). More: `apps/docs/content/conventions/git-and-ci.md`.

---

## Docs

`apps/docs` is the docs site (Fumadocs, `pnpm docs`). Its pages are Markdown in `apps/docs/content/`:

- `start-here/`, `setup/`, `reference/`: what the project is, every setup step in order (accounts, keys, cloud services, release), and the commands, variables and workflows.
- `architecture/`, `conventions/`, `guides/`: how the code is organized and how to work in it.

When a change alters something a page describes (a rule, a command, a package, a flow), update the page in the same change. When you change a rule in this file, update the matching page in `apps/docs/content/conventions/`.

---

## UI components

- **The kit rules are for the product.** They cover `apps/mobile`, `apps/web` and `apps/workshop`. The docs site (`apps/docs`) is a team tool built from Fumadocs' own components, with its diagrams and demos in `apps/docs/components`.
- **One component for web and mobile.** All UI comes from `@starter/ui` (`packages/ui`): React Native components styled with NativeWind, rendered natively by the Expo app and through react-native-web by the Next.js app. Never add a web-only or native-only copy. Where a native library has no web support, add a `*.web.tsx` file with the same props next to the component.
- **No DOM in the kit.** `packages/ui/src` can't use DOM elements (`div`, `span`, `button`…) or `react-dom`; `pnpm --filter=@starter/ui lint` fails on them. Use `View`, `Text`, `Pressable`, `TextInput`, react-native-svg and kit components. `src/emails` (the React Email kit) is the only exemption.
- **Reuse before adding.** Check the kit and the Workshop (`pnpm workshop`) first. Don't create a component that doesn't exist yet without agreeing it with the team.
- **Use kit components directly; don't wrap them to fix a prop.** A component that only renders a kit component with set props (a `ContinueButton` that is `<Button size="lg"><Text>{label}</Text></Button>`) adds a second way to draw the same thing and hides the kit's other props (`loading`, `variant`). Write the kit component at each call site; a wrapper earns its place only when it adds behavior or markup.
- **Every component has a story** (`<Name>/<Name>.stories.tsx`, in the component's own `<Name>/` folder next to its `index.tsx`), which runs in the Workshop and on device. How to add both: `packages/ui/README.md`.
- **Component files are PascalCase, named after the component**: `SignIn.tsx`, `EmailAuthForm.tsx`, never `sign-in.tsx` or `emailAuthForm.tsx`. A kit component is a folder with the same name (`Button/index.tsx`, `Button/Button.stories.tsx`). Route files are the exception, because their names are URLs or reserved by the router: `apps/mobile/app/**` (`sign-in.tsx`, `_layout.tsx`, `index.tsx`, `+not-found.tsx`) and `apps/web/app/**` (`page.tsx`, `layout.tsx`) stay as the router needs them. Hooks and other non-component modules stay camelCase (`useAuth.ts`, `device.ts`).
- **Icon buttons are the kit `Button` with `variant="ghost" size="icon"` and a kit `Icon` inside**, never a raw lucide icon inside a `Pressable`. On iOS an SVG shape takes the touch itself, so a tap on the icon's lines never reaches the button. The kit `Icon` sets `pointerEvents="none"`; if a raw icon is unavoidable, give it (or a wrapping `View`) `pointerEvents="none"`.
- **Screen headers stay put.** The title and everything beside it (back or close button, badges, icon buttons, step bars) go in one header `View` placed above the screen's `ScrollView`, never inside it, so only the content scrolls.
- **Arabic is right to left.** Use the kit `Text` (never React Native's), start/end classes (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) instead of left/right ones, and pick directional icons from `I18nManager.isRTL`. Check every new screen in Arabic. Details: the `arabic-rtl` skill.
- **Colors from tokens**: use classes such as `bg-primary` or `text-muted-foreground`, or `useTokenColor()` when a value is needed in JS; never hex values.
- **Web dev runs on webpack** (`next dev` without `--turbopack`) until Turbopack resolves react-native-web's `.web.js` files inside `node_modules`.

---

## TypeScript

- **Never use `any`, `unknown`, or type assertions (`as X`) unless they are the only possible solution.** Prefer:
  - Proper generics and type parameters
  - Union types and discriminated unions
  - Utility types (`Extract`, `Exclude`, `ReturnType`, `Parameters`, etc.)
  - Narrowing (type guards, `instanceof`, `in`, exhaustive `switch`)
  - Adding missing keys to source-of-truth data (e.g. adding a key to a translation JSON so `TranslationKey` auto-derives it) rather than casting around the type gap
  - `satisfies` operator instead of `as` for type validation without widening

  If `any` / `as any` / `unknown` genuinely cannot be avoided, add a comment explaining **why** no typed alternative exists.

- **Allowed values come from their zod enum.** Loop over `schema.options` and narrow with `schema.safeParse(value)`; never retype the list (`const LOCALES = ['en', 'fr', 'ar']`) or write a hand-made type guard for it. Data keyed by those values is a `Record<Value, …>`, so adding a value is a type error everywhere it is missing.

- **Translation keys** — never cast `t('some.key' as any)`. Instead add the missing key to every locale file (`en.json`, `fr.json`, and `ar.json` on mobile) so `TranslationKey` is derived automatically from the JSON shape.

- **Never leave a translation empty** (`""`). react-intl treats an empty message as missing and shows the key on screen. When a line has no place in one language, leave it out in code. `translations.test.ts` fails on empty messages.

- **Dynamic template literal keys** (a key built from a prefix and a runtime value) — narrow them with a typed helper or an `Extract` over `TranslationKey` restricted to that prefix, not `as any`.

---

## API

How to apply these: the `add-api-feature-guide` skill.

- **One layout per module**: `<module>.router.ts` → `.handlers.ts` → `.services.ts`, with `.errors.ts`, `.test.ts`, and `.utils.ts` or a `utils/` folder. Only services and utils use the database; services never import tRPC.
- **Responses carry data only.** Never `status: 'ok'` or a success flag: return the data, and throw an error class from `<module>.errors.ts` for a failure, so the HTTP status and `data.reason` tell the app what happened.
- **tRPC for our own apps.** A plain Fastify route only for outside callers (health checks, webhooks).
- **A procedure that has shipped never breaks**: only add optional inputs and new outputs; a breaking change is a new procedure.

---

## Database

- The Prisma schema lives in `packages/database/prisma/`, one folder per API module (`auth/`, `notes/`).
- **Never create or edit migration files.** Change the schema only; the team writes the migrations. Don't run `prisma migrate dev`, `prisma migrate diff` or anything else that writes to `prisma/migrations`.

---

## Shared Contracts

- Shared data shapes are zod schemas in `packages/common/src/schemas`. Change the schema first, then the callers.
- Limits the app and the API both check (password length…) are constants exported next to the schema (`PASSWORD_MIN_LENGTH`). The app's forms and messages import them; never retype the number. The same holds inside one app: a limit a schema checks and an input enforces (`maxLength`) is one constant exported next to that schema (`<FIELD>_MAX_LENGTH`), never a number typed in both places.
- Colors, radii, spacing and font families live in `packages/design-tokens/src/tokens.ts`. Edit them there, then run `pnpm --filter=@starter/design-tokens generate`; never hardcode them in a Tailwind config or CSS file.
- Product naming lives in `packages/common/src/brand.ts`. Never hardcode the product name in UI copy or emails; read `brand.displayName`.
- Never use a Prisma `enum`. Store the value in a `String` column and declare its allowed values as a zod enum in `packages/common/src/schemas` (e.g. `oauthProviderSchema`). Import its type into the `PrismaJson` namespace in `packages/database/prisma/json-types.ts`, then type the column with `/// [OAuthProvider]` above it so the Prisma client returns the enum type. Validate input with the schema.
- Each `.prisma` file holds a single model and is named after it (`packages/database/prisma/auth/User.prisma`).
- Environment variables are declared once in the root `.env.example` (and validated in `apps/web/env.ts` for the website and `apps/api/src/env.ts` for the API). When you add a variable, update both.
