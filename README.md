# setupwise

A CLI that checks and sets up everything a project needs outside its code, plus its docs site.

| Folder           | What                                                          |
| ---------------- | ------------------------------------------------------------- |
| `packages/cli`   | The `setupwise` npm package (CLI and `defineConfig` API)      |
| `apps/docs`      | The docs, built with Fumadocs (default theme, light and dark) |
| `examples/basic` | A sample `setupwise.config.ts`                                |

## Develop

```sh
pnpm install
pnpm build              # builds the CLI and the docs
pnpm test               # CLI tests
pnpm dev:docs           # docs on http://localhost:3010
pnpm sw doctor          # run the built CLI from here
```

Try the CLI in another project without publishing:

```sh
cd packages/cli && pnpm build && npm link
cd ~/some-project && setupwise doctor
```

## Publish to npm

Not published yet. When ready:

```sh
cd packages/cli
npm login
pnpm publish --access public    # runs typecheck, tests and build first
```

Before the first publish, set `repository`, `homepage` and `author` in `packages/cli/package.json`, and `DOCS_BASE` in `packages/cli/src/commands/run-modules.ts` to where the docs are hosted. Set the docs' GitHub owner in `apps/docs/lib/site.ts`.
