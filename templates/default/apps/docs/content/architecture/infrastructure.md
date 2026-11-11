---
title: 'Infrastructure'
description: 'What the backend runs on in Google Cloud, and how to set it up and change it.'
---

Everything in Google Cloud (services, secrets, accounts, permissions) is written as code in `infra/`, with [OpenTofu](https://opentofu.org) (the open-source fork of Terraform). Nobody changes it by clicking in the console: you change the code in a pull request, read the plan CI posts on it, and merge.

## What runs where

Staging and production live in one Google Cloud project, each with its own services and secrets.

| Service                 | What it is                                                                               | Secrets it reads                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `api-<environment>`     | `apps/api`: accounts and progress sync (tRPC)                                            | `DATABASE_URL`, `AUTH_SECRET`, `API_KEY`, `REDIS_URL`, plus the optional ones set |
| `web-<environment>`     | `apps/web`: the marketing site                                                           | None                                                                              |
| The database (Postgres) | Not managed here. `DATABASE_URL` points at it.                                           |                                                                                   |
| Redis                   | Not managed here. `REDIS_URL` points at it; the API shares rate-limit counts through it. |                                                                                   |
| The iOS app             | TestFlight and the App Store, not Google Cloud.                                          | See [Mobile deployment](../setup/6-apple.mdx)                           |

Both services are on Cloud Run and scale to zero when nobody uses them.

## The stacks

| Folder                            | What it creates                                                                                                       | Applied                          |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `infra/shared`                    | APIs, the image registry `starter-app-docker`, keyless login from GitHub Actions, the OpenTofu and Cloud Build accounts | With staging, on merge to `main` |
| `infra/envs/staging`              | Staging secrets, the `api-staging` and `web-staging` services, the `deploy-staging` account                           | On merge to `main`               |
| `infra/envs/production`           | The same for production                                                                                               | On merge to `production`         |
| `infra/modules/environment`       | What one environment holds; both environments use it                                                                  |                                  |
| `infra/modules/cloud-run-service` | One public Cloud Run service and its runtime account                                                                  |                                  |

OpenTofu owns each service's size, environment variables, secrets and public access. The deploy workflows only change the image it runs.

The state is stored in the bucket `<project>-tofu-state` and encrypted with a Cloud KMS key before it leaves your computer or CI. `infra/bootstrap.sh` creates both, because OpenTofu needs them before it can store anything.

GitHub Actions logs in to Google Cloud without keys (Workload Identity Federation). Only this repository can log in, pull requests can only plan, and only `main` and `production` can apply or deploy.

## Setting up a new project

You need OpenTofu 1.12 (`brew install opentofu`), the `gcloud` CLI logged in as a project owner, Application Default Credentials (`gcloud auth application-default login`), and optionally the GitHub CLI (`gh auth login`).

1. Create a Google Cloud project with billing turned on.
2. Set `GCP_PROJECT_ID` in the root `.env`.
3. Run `pnpm infra:init`. It runs `infra/bootstrap.sh` if the state bucket is missing, applies each stack that has never been applied (you read each plan and type `yes`), and sets the `GCP_PROJECT_ID` and `GCP_WIF_PROVIDER` repository variables with `gh`.
4. Commit the `.terraform.lock.hcl` files it wrote, and merge.
5. Give each secret its real value, for staging and production (see below).
6. Create the `production` branch: `git push origin main:production`. The Infrastructure workflow only runs on pushes that change `infra/`, so then apply production once by hand: Actions → **Infrastructure** → Run workflow on `production`. Until then the `deploy-production` account can't upload builds.
7. Push to `main` and to `production`: **Deploy Staging** and **Deploy Production** run on every push or merge to those branches (or run them by hand from the Actions tab). A pull request with the `skip-staging-deploy` label is merged into `main` without deploying staging.

A deploy builds `api` or `web` only when something it builds from changed since the commit its Cloud Run service runs now (images are tagged with their commit). A service still on the placeholder image, or on an image this repository didn't build, is always deployed. **Force deploy all services** skips the check.

`pnpm infra:describe` lists what each stack manages and prints its outputs (the service addresses). Until the two repository variables exist, the Infrastructure workflow skips plans and applies with a notice instead of failing.

## Changing infrastructure

1. Change the code in `infra/` on a branch and open a pull request into `main`.
2. The **Infrastructure** workflow checks formatting (`tofu fmt`), validates every stack and posts the staging plan on the pull request.
3. Merging applies `infra/shared` and staging.
4. To promote to production, open a pull request from `main` into `production`. Its plan shows the production changes, and merging applies them.

Avoid `tofu apply` from your computer once CI is set up: it applies whatever is on your branch, which the next CI apply may undo.

## Common changes

**Give a secret its value.** Secrets are created empty (the required ones hold a placeholder so Cloud Run can start). Write the values in `.env.staging` or `.env.production` at the repository root (gitignored), with the API's own names (`DATABASE_URL`, `AUTH_SECRET`, `API_KEY`, `RESEND_API_KEY`, `GOOGLE_OAUTH_CLIENT_IDS`, `REDIS_URL`), then run:

```sh
pnpm secrets:set staging           # dry run: what is set, what would change
pnpm secrets:set staging --apply   # adds a new version where the value differs
```

It reads the list of secrets from `infra/` (required, optional and external ones), compares values without printing them, warns about a required secret still on its placeholder and about an optional one the API doesn't read yet, and creates an external secret (such as `REDIS_URL_STAGING`) when it is missing. A name left out of the file is left as it is. By hand, one secret at a time:

```sh
printf '%s' '<value>' | gcloud secrets versions add DATABASE_URL_STAGING --project=<project> --data-file=-
```

Secrets are named `<NAME>_STAGING` and `<NAME>_PRODUCTION`. The API reads the latest version when a new revision starts.

**Turn on an optional secret.** `RESEND_API_KEY` (email codes) and `GOOGLE_OAUTH_CLIENT_IDS` (Google sign-in) exist but aren't passed to the API until they hold a value. Give the secret a value, then add its name to `api_optional_secrets` in `infra/envs/<environment>/main.tf`.

**Use a secret created outside OpenTofu.** `api_external_secrets` in `infra/envs/<environment>/main.tf` maps an environment variable to an existing secret, which OpenTofu never creates or changes; it only lets the API read it. The external Redis is set up this way: `REDIS_URL` reads `REDIS_URL_STAGING` in staging and `REDIS_URL_PROD` in production. Each secret must hold a value before the change is applied, or Cloud Run won't start the revision.

**Add a plain environment variable.** Non-secret values such as `APPLE_SIGN_IN_IOS_BUNDLE_ID` go in `api_env` (or `web_env`) in `infra/envs/<environment>/main.tf`. Sign in with Apple on the iPhone needs no secret.

**Set the API address.** `api_url` in each environment is a placeholder (`example.com`) until a domain points at Cloud Run.

## Running OpenTofu by hand

After `pnpm infra:init`, export the project, then run any command with `-chdir`:

```sh
export TF_VAR_project_id=<project>
export GOOGLE_CLOUD_QUOTA_PROJECT=<project>
tofu -chdir=infra/envs/staging plan
```

`GOOGLE_CLOUD_QUOTA_PROJECT` bills the API calls to this project. Without it, calls go to the last project your Application Default Credentials used, and fail with "KMS API has not been used in project …".
