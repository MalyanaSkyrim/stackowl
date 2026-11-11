# Tooling

Scripts for the iOS release. The setup checks (`pnpm doctor`, `pnpm secrets:set`,
`pnpm github:vars`) come from the `setupwise` package, configured in the root
`setupwise.config.ts`.

## Mobile

- `setup-mobile-signing.sh` (`pnpm mobile:signing`) - One-time iOS signing setup for the deploy workflow: Fastlane Match certificates in a private repo, a read-only CI deploy key, the `production` GitHub secrets and the first `fastlane match appstore`. See `apps/docs/content/guides/mobile-deployment.md`.
- `deploy-mobile.sh [staging|production]` (`pnpm mobile:deploy`) - Build the iOS app locally and upload it to TestFlight with Fastlane. See `apps/docs/content/guides/mobile-deployment.md`.

See the root `package.json` for all available scripts.
