---
title: 'State and storage'
description: 'Where the mobile app keeps its state, and what is saved on the phone.'
---

| What                          | Where                                        | Why                                             |
| ----------------------------- | -------------------------------------------- | ----------------------------------------------- |
| Settings (language, theme)    | Jotai atoms saved in the key-value store     | Small values, read synchronously on launch      |
| The session (user and tokens) | The iOS Keychain (expo-secure-store)         | Secrets never sit in plain storage              |
| The user's data (notes)       | The API's database, cached by TanStack Query | Shared across the user's phones, behind sign-in |

Server data is never copied into an atom: the screen reads it with `useQuery(trpc.notes.list.queryOptions())`, and a change refreshes the query (`invalidateQueries`), as `app/notes/[id].tsx` does.

## Jotai

- The root layout wraps the app in a Jotai `Provider` with `appStore` (`src/lib/store/appStore.ts`). Code outside React, such as a notification handler, reads and writes atoms through `appStore.get` / `appStore.set`.
- Atoms live in `src/lib/store/`, one file per area (`language.ts`, `theme.ts`, …). Screens use them through `useAtom` / `useAtomValue`, or through a small hook in `lib/hooks/` when there is logic around them (see `lib/hooks/useChangeLanguage.ts`).
- An atom that only lives in memory is a plain `atom()`.

## Saving atoms on the phone

Saved atoms use `atomWithDeviceStorage(key, schema, initialValue)` from `src/lib/store/deviceStorage.ts`:

```ts
// src/lib/store/keys.ts
export const STORAGE_KEYS = {
  unlockMinutes: 'settings.unlock-minutes',
} as const

// src/lib/store/unlock.ts
export const unlockMinutesAtom = atomWithDeviceStorage(
  STORAGE_KEYS.unlockMinutes,
  z.union([z.literal(5), z.literal(15), z.literal(30)]),
  15,
)
```

- **Storage library: `expo-sqlite/kv-store`.** It is a key-value store that ships with expo-sqlite, so it adds a small native module that also gives you SQLite if you need it later, and it works in Expo Go.
- **No flash on cold start.** The store has synchronous reads, and the atoms are created with `getOnInit: true`, so the first render already has the saved value. Nothing waits for a load step and the splash screen does not depend on it.
- **Every key is listed in `src/lib/store/keys.ts`.** That file is the list of what the app saves.
- **Every value has a zod schema.** A value that is missing, not JSON, or no longer matches the schema (after we change its shape) falls back to the initial value instead of reaching the UI. Change the schema and the initial value together.
- Group values that always change together in one key (one object for all unlock settings), and keep values that change on their own in separate keys.

**Secrets go to the Keychain instead**, through `atomWithSecureStorage` (`src/lib/store/secureStorage.ts`, keys in `SECURE_STORAGE_KEYS`). It works the same way, with synchronous reads from expo-secure-store. Today it holds one value, the session (`src/lib/store/session.ts`): the signed-in user and the access and refresh tokens. The API client reads and refreshes it through `appStore`.

Alternatives we looked at: `react-native-mmkv` is faster but needs a development build and one more native module, for no visible gain with values this small; `@react-native-async-storage/async-storage` is async only, which brings back the flash of default state.
