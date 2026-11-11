---
title: 'Adding a feature'
description: 'The order to build a feature in, from the data to the screen, following the notes example.'
---

Build features in this order, so each step is settled before the next one depends on it.

The notes feature is the worked example: copy its files for your feature, rename, then delete the notes.

1. **Contract.** The zod schemas and limits in `packages/common/src/schemas/<feature>/` (notes: `schemas/notes/index.ts`). The API validates with them and the app's inputs use the same limits.
2. **Data.** One Prisma model per file in `packages/database/prisma/<feature>/` (notes: `notes/Note.prisma`), related to `User` with `onDelete: Cascade`. Run `pnpm db:push` locally; write the migration yourself before merging.
3. **API.** A module in `apps/api/src/modules/<feature>/`: router → handlers → services, errors and tests (notes: `modules/notes/`). Add its router to `src/trpc/router.ts`.
4. **UI.** The screens in `apps/mobile/app/` (notes: `app/(home)/index.tsx`, `app/notes/[id].tsx`), built from `@starter/ui`, with their loading, empty, error and signed-out states. Missing a component? Add it to the kit with a story.
5. **Text.** Every string in `apps/mobile/src/lib/i18n/messages/` in English, French and Arabic (and `apps/web/locales/*.json` for the website).

## Guides for each part

| Building                    | Read                                                                                                                                               |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| A mobile feature            | [`add-app-feature-guide`](https://github.com/your-github-user/starter-app/blob/main/.claude/skills/add-app-feature-guide/SKILL.md)                 |
| A mobile screen's structure | [`react-native-component-layers`](https://github.com/your-github-user/starter-app/blob/main/.claude/skills/react-native-component-layers/SKILL.md) |
| A mobile form               | [`react-native-forms`](https://github.com/your-github-user/starter-app/blob/main/.claude/skills/react-native-forms/SKILL.md)                       |
| A website page              | [`add-web-feature-guide`](https://github.com/your-github-user/starter-app/blob/main/.claude/skills/add-web-feature-guide/SKILL.md)                 |
| A UI kit component          | [UI conventions](../conventions/ui.md) and `packages/ui/README.md`                                                                                 |
