---
name: add-app-feature-guide
description: Quick reference for building features in the mobile app (React Native / Expo) with feature folders, local storage, native Apple APIs, React Query, toasts and best practices. Use ONLY for mobile applications, NOT for web applications.
---

# New Feature Guide

Quick reference for building features in the mobile app.

## When to Use

- Use ONLY for mobile applications (React Native / Expo, e.g., `apps/mobile`)
- Do NOT use for web applications (`apps/web`, `packages/ui`, etc.)
- Use when building a new feature in the mobile app
- Use when storing settings or progress on the phone
- Use when wrapping a native Apple API (notifications, location, the camera)
- Use when deciding between custom hooks vs context in mobile app

## Instructions

### Talking to the API

Call the API (`apps/api`) through `useTRPC()` from `src/lib/api/trpc.ts`, with TanStack Query (`useQuery(trpc.notes.list.queryOptions())`, `useMutation(trpc.notes.create.mutationOptions())`). The Notes tab (`app/(home)/index.tsx`, `app/notes/[id].tsx`) is the reference: loading, empty, error and signed-out states, and refreshing the list after a change.

### Feature structure

Read the feature's page in `apps/docs/content/` first, if there is one, then:

- **Screen** (layout only): `app/...` route file. See the `react-native-component-layers` skill.
- **Feature logic**: `src/components/<feature>/` for feature components, `lib/hooks/` for reusable logic.
- **State**: Jotai atoms in `src/lib/store/`, one file per area, for example `src/lib/store/onboarding.ts`.
- **Schemas**: zod schemas next to the feature, or in `packages/common/src/schemas` when another app needs them.

### Native Apple APIs

Wrap every native library (for example `expo-apple-authentication` for Sign in with Apple) in one small module in `lib/native/<name>.ts`, and call only that module from the rest of the app. If the library is replaced, only that file changes.

### React Query

Use it only for async work worth caching (for example a list loaded from the API):

- **Queries:** Use `createQueryOptions()` - retries on network errors
- **Mutations:** Use `createMutationRetry()` - only retries network errors
- **A query that drives a button or a gate handles `isError`**, not only `data === undefined`. Otherwise a failed query looks like loading forever: the button spins and stays disabled with no way out. Fall back to a state the user can act on (a permission check that fails counts as `notDetermined`, so the system prompt still gives the real answer). A native check that throws throws again: `retry: false`.

### Async failures

- **Never drop a promise with `void`** unless the function handles its own failure, and say so in a comment at the call site. A rejection nobody catches leaves the user with no feedback.
- An async action that changes state before its last step (saves the language, then reloads the app) **undoes what it already changed when that step fails**, so the app is never half switched (Arabic text on a left-to-right layout). Then it tells the user with `toast.error` and resolves to a result (`'failed'`) instead of rejecting. See `lib/hooks/useChangeLanguage.ts`.

### Loading on async actions

Every button or action that starts async work (an API call, a native sheet's follow-up request, a save) shows it is busy until the work ends, so the user knows the tap landed and can't send it twice:

- While the action is pending, the button is **both disabled and loading**: pass the pending state to `disabled` and to the kit `Button`'s `loading` prop (spinner). `disabled` also covers "can't submit yet" (invalid form, countdown running): `disabled={!canSave || save.isPending}`.
- Take the pending state from the mutation (`mutation.isPending`), and in a form also from `form.formState.isSubmitting`; never a hand-made `useState` flag.
- When one mutation serves several buttons (Apple and Google sign-in), spin only the tapped one, from `mutation.variables`, and disable the others.
- A custom button that can't use the kit spinner (its colors don't fit, like `AppleSignInButton` in `lib/native/AppleSignIn.tsx`) takes its own `loading` prop and draws an `ActivityIndicator` in place of its icon.
- Content that loads (a list, a card) shows the kit `Skeleton` while its query is pending.

```tsx
const save = useMutation(trpc.settings.save.mutationOptions({ onError: showError }))

<Button disabled={!canSave || save.isPending} loading={save.isPending} onPress={() => save.mutate(values)}>
  <Text>{t('save')}</Text>
</Button>
```

### Toast Notifications

Use `toast` from `@starter/ui` (`toast.success(...)`, `toast.error(...)`); the root layout mounts the `Toaster`. Build screens from the universal components in `@starter/ui`, which the web app shares.

### Custom Hooks & Refactoring

Extract complex logic when: multiple related state, multiple effects, reusable logic, or complex business logic.

- **Global state:** Context (`lib/contexts/`) or a Jotai atom (`src/lib/store/`)
- **Reusable logic:** Custom hook (`lib/hooks/`)

### Updating state

- **Update an object atom with a function**: `setAnswers((previous) => ({ ...previous, dailyMinutes }))`, never `setAnswers({ ...answers, dailyMinutes })` with the value read during render. Two writes before the next render (a double tap, a step that sets two fields) would start from the same stale value, and the first change would be lost.
- The same goes for values computed from the current one: a stepper adds to `previous.dailyMinutes`, not to the `minutes` it rendered.

### Storage

- **Settings and preferences:** a Jotai atom made with `atomWithDeviceStorage` (`src/lib/store/`), its key in `src/lib/store/keys.ts` - see `apps/docs/content/architecture/state-and-storage.md`
- **Server data (notes and the like):** the API, cached by TanStack Query; never a second copy in an atom

Don't use AsyncStorage directly.

### Multi-step flows

- **Each step is its own route** (`app/auth/forgot-password.tsx` → `reset-password.tsx` → `password-updated.tsx`), not local state on one screen. The header back button calls `router.back()`, so it and the iOS swipe-back gesture always do the same thing, and what the user typed on the earlier step is still there.
- Pass what the next step needs as route params (`email`, `resendIn`).
- **Let `NavigationGuard` (`app/_layout.tsx`) do the redirect it already does.** When finishing a flow flips the state it watches (onboarding complete, signed out), change the state only: calling `router.replace` too opens the next screen twice. Don't reset the screen's own state (back to step one) on the way out either: the screen redraws that state under the transition.
- A last step after which going back makes no sense (already signed in, already saved) is opened with `router.replace` and turns swipe-back off with `<Stack.Screen options={{ gestureEnabled: false }} />`; its buttons close the flow.

### Code screens

- A one-time code uses the kit `OtpInput` (or `FormOtpInput` in a form), never a plain `FormInput`: it keeps the boxes left to right in Arabic and handles paste and autofill.
- The resend line is `ResendCodeRow` (`src/components/auth/`). When the API can't say whether a code went out (an unknown email, a cooldown it keeps quiet about), its message must not promise one.
- Emails and codes inside a sentence are `<Text script="latin">`, never interpolated into the translated string.

### Text

Add every string to `src/lib/i18n/messages/` in English, French and Arabic. Arabic is right to left: follow the `arabic-rtl` skill and check each new screen in Arabic.

**Hermes has only part of `Intl`.** It has `NumberFormat`, `DateTimeFormat` and `Collator`, but no `PluralRules`, `Locale`, `RelativeTimeFormat`, `ListFormat` or `DisplayNames`. The tests run in Node, which has them all, so a missing API only shows up on the phone (a red box and the raw key). An ICU `plural` or `selectordinal` message, or a new `Intl` API, works only once `src/lib/i18n/polyfills.ts` (loaded first from `index.ts`) polyfills it with data for every app language. A polyfill's own dependencies can need more of `Intl` than the polyfill does: `intl-pluralrules` matches a regional tag (the device's `fr-MA`) with `Intl.Locale`, so `Intl.Locale` is polyfilled first. A test for an `Intl` polyfill imports `src/lib/i18n/hermesIntl.ts` before `polyfills.ts`, so it runs against Hermes's `Intl` rather than Node's, and tries regional tags, not only `en`, `fr` and `ar` (see `plurals.test.ts`). Adding a language means adding its locale-data import to `polyfills.ts`.

### Best Practices

- ✅ Keep native libraries behind one wrapper module each
- ✅ Extract complex logic to hooks/contexts
- ✅ Disable and show `loading` on every button while its async work runs
- ✅ Update object atoms with a function of the previous value
- ✅ Handle the error state of every query and async action the user waits on
- ❌ Don't wrap a kit component only to fix its props (`ContinueButton`): use the kit component
- ❌ Don't put business logic in screen components

### When to Ask Questions

Use ask questions tool if unclear on:

- The business rule for the feature
- Whether to use hook vs context
- Storage strategy for specific data types
