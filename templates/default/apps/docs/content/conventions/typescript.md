---
title: 'TypeScript'
description: 'How we keep types honest, and what to do instead of casting.'
---

## No `any`, no `as`, no `unknown`

Never use `any`, `unknown` or type assertions (`as X`) unless they are the only possible solution. Use instead:

- generics and type parameters;
- union types and discriminated unions;
- utility types (`Extract`, `Exclude`, `ReturnType`, `Parameters`…);
- narrowing: type guards, `instanceof`, `in`, an exhaustive `switch`;
- fixing the source of the type, for example adding a missing key to a translation file so the key type includes it;
- `satisfies` instead of `as` to check a value without widening it.

A fixed set of values is a zod enum, and the code reads the set from it: loop over `schema.options` and narrow with `schema.safeParse(value)`, rather than retyping the list or writing a type guard by hand.

When `any`, `as any` or `unknown` truly cannot be avoided, add a comment explaining why no typed alternative exists.

## Translation keys

The translation key type is derived from the locale JSON files. Never cast a key (`t('some.key' as any)`). Add the missing key to every locale file instead (`en.json`, `fr.json`, and `ar.json` on mobile).

Never leave a message empty (`""`): react-intl shows the key instead. Leave the line out in code.

When a key is built from a prefix and a value at runtime, narrow it with a typed helper or an `Extract` over the key type restricted to that prefix, not with `as any`.

## Shared settings

Each workspace extends a TypeScript config from `@starter/config` (`typescript/base.json`, `nextjs.json`, `react-library.json`, `server.json`). The base config is strict and turns on `noUncheckedIndexedAccess`.

## Formatting and imports

Prettier formats every file (no semicolons, single quotes, trailing commas, 80 columns) and sorts imports. Run `pnpm format`; a pre-commit hook formats staged files for you.
