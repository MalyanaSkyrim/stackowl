<p align="center"><img src=".github/logo.svg" width="72" alt="" /></p>

<h1 align="center">StackOwl</h1>

A CLI that creates a full app (website, API, iPhone app, docs, infra) and checks and sets up everything a project needs outside its code, plus its docs site.

| Folder           | What                                                          |
| ---------------- | ------------------------------------------------------------- |
| `packages/cli`   | The `stackowl` npm package (CLI and `defineConfig` API)      |
| `apps/docs`      | The docs, built with Fumadocs (default theme, light and dark) |
| `examples/basic` | A sample `stackowl.config.ts`                                |

## Develop

```sh
pnpm install
pnpm build              # builds the CLI and the docs
pnpm test               # CLI tests
pnpm dev:docs           # docs on http://localhost:3010
pnpm sw doctor          # run the built CLI from here
```

Create a project with your local checkout (the new project links to it):

```sh
node packages/cli/dist/index.js create ../my-app
```

Try the CLI in another project without publishing:

```sh
cd packages/cli && pnpm build && npm link
cd ~/some-project && stackowl doctor
```

## Publish to npm

Published as [`stackowl`](https://www.npmjs.com/package/stackowl). To release a new version:

```sh
cd packages/cli
npm version patch
pnpm publish --access public    # runs typecheck, tests and build first
```

`pnpm publish` copies `templates/default` into the package first (`prepack`). The installers in `install/` run `npx stackowl@latest`, so they work once the package is published and the repository is public; test them before with `STACKOWL_CLI=/path/to/stackowl-0.1.0.tgz bash install/install.sh my-app`.

On a new computer:

```sh
curl -fsSL https://raw.githubusercontent.com/MalyanaSkyrim/stackowl/main/install/install.sh | bash -s my-app
```
