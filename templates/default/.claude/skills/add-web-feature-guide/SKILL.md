---
name: add-web-feature-guide
description: Guidelines and best practices for building features in Next.js web applications (apps/web) with next-intl, @starter/ui component reuse, named constant handlers, accessibility, and modular refactoring. Use ONLY for web applications, NOT for mobile.
---

# Web Feature Guide (Next.js & @starter/ui)

Standard workflow and rules for implementing web features in `apps/web`.

## When to Use

- Use ONLY for web applications (`apps/web`, `packages/ui`)
- Do NOT use for mobile applications (`apps/mobile`)
- Use when building new web pages, tabs, modals, or web features
- Use when refactoring web components

---

## Core Guidelines

### 1. Internationalization (`next-intl`)

- **Never hardcode user-facing strings.**
- Always use `useTranslations('namespace')` for text and `useLocale()` for locale-aware formatting.
- **Maintain locale parity:** When adding or updating a translation key, update all locale files (`en.json`, `fr.json`, etc.) synchronously.
- **Strictly typed keys:** Never cast `t('key' as any)`. Translation keys are auto-derived from the JSON shape.
- Use locale-aware formatters:
  ```tsx
  const locale = useLocale()
  const formatDate = useCallback(
    (date: Date) =>
      new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(date)),
    [locale],
  )
  ```

---

### 2. Event Handlers & Callback Props

- **Never use inline arrow functions directly in JSX props** (e.g. `onClick={() => setOpen(true)}` or `onValueChange={(val) => setTab(val)}`).
- **Always declare named constant handlers above the `return` statement** using `useCallback` and pass the function reference directly:

  ```tsx
  // ✅ GOOD: Declared above return statement
  const handleOpenDialog = useCallback(() => {
    setIsDialogOpen(true)
  }, [])

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false)
  }, [])

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
  }, [])

  return (
    <div>
      <Button type="button" onClick={handleOpenDialog}>
        {t('open_button')}
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        ...
      </Dialog>
    </div>
  )
  ```

---

### 3. Reuse Components from `@starter/ui`

- `@starter/ui` is the **universal kit**: React Native components styled with NativeWind, rendered on the web through react-native-web. The same component serves `apps/web` and `apps/mobile`, so never build a web-only copy of something the kit has.
- **Always reuse existing kit components**, for example:
  - `Button` (put a `Text` inside), `Card`, `CardContent`, `CardHeader`, `CardTitle`
  - `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
  - `ToggleGroup`, `RadioGroup`, `Switch`, `ProgressBar`, `Skeleton`
  - `Form`, `FormInput`, `FormField` for forms; `toast()` and the `Toaster` for notifications
- A `Button` that starts async work (a form post, a mutation) is disabled and shows `loading` (spinner) until the work ends: `disabled={isPending} loading={isPending}`.
- Inside kit components, text goes in `Text` and layout in `View` / `Pressable`; DOM tags are blocked by lint in `packages/ui/src`.
- Browse every component and its variants in the Workshop (`pnpm workshop`).
- A component the kit lacks goes into `packages/ui` with a story, not into the app (see `packages/ui/README.md`).

---

### 4. Accessibility (a11y)

- **Keyboard Navigation:** Ensure all interactive custom elements support keyboard navigation (`tabIndex={0}`, `role="button"`, and `onKeyDown` with `Enter` and `Space` detection).
- **Interactive Guards:** When attaching row/container click handlers, guard against nested interactive elements (buttons, links, inputs, checkboxes, dropdown items) so clicking child actions does not trigger parent container navigation.
- **Labels & ARIA:**
  - Provide accessible names for icon-only buttons (`aria-label` or `<span className="sr-only">Label</span>`).
  - Use semantic HTML (`<main>`, `<header>`, `<nav>`, `<h1>` heading hierarchy).
  - Use `aria-describedby` and `aria-invalid` for form error states.
- **Modal Dialogs:** Ensure `DialogFooter` provides consistent spacing (`gap-3`) between action buttons.

---

### 5. Component Refactoring & Architecture

- **Granular Data Fetching:** Each dashboard/overview card or tab section should fetch its own data using its own dedicated query and display its own loading skeleton.
- **Single Responsibility:** Break large screens (> 100-150 lines) into focused subcomponents placed in a local `components/` folder with a barrel export (`index.ts`).
- **Strict TypeScript:**
  - Zero `any` and zero type assertions (`as X`).
  - Use discriminated unions, narrowing, and `satisfies` operator.

---

### 6. Styling & Class Merging (`cn`)

- **Use `cn`** (from `@starter/ui`, or `../../lib/utils` inside the kit) to combine Tailwind class names. It is `twMerge(clsx(...))`, the helper react-native-reusables components use:

  ```tsx
  import { cn } from '@starter/ui'

  ;<View className={cn('flex-row items-center gap-2', className)} />
  ```

- `classMerge` is the same function under its old name, kept so existing code still works; prefer `cn` in new code.
