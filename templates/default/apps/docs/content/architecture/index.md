---
title: 'Architecture'
description: 'The big picture, how the apps and the shared packages fit together.'
---

The project is one repository (a **monorepo**) that holds every app and every shared piece of code. Change a shared piece once, and every app that uses it gets the change.

## The big picture

```text
                 ┌──────────────────────────┐
                 │  @starter/ui           │  one UI kit (React Native + NativeWind)
                 │  @starter/design-tokens│  colors, type, radii, shadows
                 └──────┬─────────────┬─────┘
                        │             │
        renders natively│             │renders in the browser (react-native-web)
                        ▼             ▼
               apps/mobile        apps/web             apps/workshop
               (Expo, iPhone)     (Next.js, landing)   (Storybook of the kit)
                        │ tRPC (end-to-end types)
                        ▼
               apps/api (Fastify + tRPC) ──► packages/database (Prisma, CockroachDB)

    @starter/common: shared zod schemas, brand, utilities
```

In words:

- **One UI kit for every screen.** Components are written once in React Native. The phone app renders them natively; the web app renders the same components in the browser. See [UI kit](ui-kit.md).
- **One API, typed end to end.** The app calls the API with tRPC; the inputs are zod schemas from `@starter/common`, so a change to a procedure is a type error in the app until it follows. Settings live on the phone; the user's data lives in the database, behind sign-in. Where each kind of data is kept: [State and storage](state-and-storage.md).
- **A worked example.** The notes feature goes through every layer (Prisma model, API module, app screens): [Adding a feature](adding-a-feature.md).

## What is built

| Area                | State                                                              |
| ------------------- | ------------------------------------------------------------------ |
| Mobile app          | Sign-in, the notes example, settings, English/French/Arabic        |
| API and database    | Server, schema, accounts (email, Apple, Google) and the notes example |
| Website             | Landing page, privacy policy, terms and support, English/French    |
| UI kit and Workshop | One universal kit, every component has a story                     |

## The tools

| Tool                                   | Used for                                                     |
| -------------------------------------- | ------------------------------------------------------------ |
| pnpm + Turborepo                       | Workspaces and running tasks across them                     |
| TypeScript 5.9                         | Every app and package                                        |
| Next.js 15                             | The web app                                                  |
| Expo 55, React Native 0.83             | The mobile app                                               |
| NativeWind (Tailwind for React Native) | Styling everywhere                                           |
| zod 4                                  | Validation and shared contracts                              |
| Storybook 10                           | The Workshop                                                 |
| GitHub Actions, Fastlane, TestFlight   | CI and iOS releases                                          |
| OpenTofu, Google Cloud Run             | Backend infrastructure ([Infrastructure](infrastructure.md)) |

