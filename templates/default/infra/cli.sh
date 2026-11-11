#!/usr/bin/env bash

# Local OpenTofu helpers for the three stacks, run from the repo root through
# `pnpm infra:init` and `pnpm infra:describe`. Both read GCP_PROJECT_ID from the
# root .env (loaded by `pnpm with-env`) and pass it on as TF_VAR_project_id.
# Credentials come from `gcloud auth application-default login`.
#
# Usage: infra/cli.sh <init|describe>
#   init      the first-time setup, safe to run again:
#               1. bootstrap.sh, if the state bucket is missing
#               2. tofu init in every stack
#               3. tofu apply in every stack that has never been applied
#                  (you review each plan and type yes)
#               4. the GCP_PROJECT_ID and GCP_WIF_PROVIDER GitHub variables
#   describe  lists what each stack manages and prints its outputs
#
# A stack is applied from here only while its state is empty. After that, changes
# go through pull requests and .github/workflows/infra.yml. If a first apply fails
# halfway, the stack has some state and is not retried: finish it with
# `tofu -chdir=infra/<stack> apply` (TF_VAR_project_id and
# GOOGLE_CLOUD_QUOTA_PROJECT exported), or merge and let CI apply it.

set -euo pipefail

STACKS=(shared envs/staging envs/production)
INFRA_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -z "${GCP_PROJECT_ID:-}" ]; then
  echo "GCP_PROJECT_ID is not set. Add it to the root .env (see .env.example)."
  exit 1
fi

if ! command -v tofu &> /dev/null; then
  echo "OpenTofu is not installed. Install it with: brew install opentofu"
  exit 1
fi

export TF_VAR_project_id="$GCP_PROJECT_ID"
# Bill API calls to this project, whatever quota project your ADC login has
# (otherwise KMS and GCS calls go to the last project you used gcloud with).
export GOOGLE_CLOUD_QUOTA_PROJECT="$GCP_PROJECT_ID"

is_applied() {
  [ -n "$(tofu -chdir="$INFRA_DIR/$1" state list)" ]
}

set_github_variables() {
  local provider
  provider="$(tofu -chdir="$INFRA_DIR/shared" output -raw workload_identity_provider)"

  if command -v gh &> /dev/null && gh auth status &> /dev/null \
    && gh variable set GCP_PROJECT_ID --body "$GCP_PROJECT_ID" \
    && gh variable set GCP_WIF_PROVIDER --body "$provider"; then
    echo "→ GitHub variables GCP_PROJECT_ID and GCP_WIF_PROVIDER are set"
  else
    echo "→ Could not set the GitHub variables (needs gh, logged in, with admin on the repo). Set them by hand:"
    echo "    gh variable set GCP_PROJECT_ID --body $GCP_PROJECT_ID"
    echo "    gh variable set GCP_WIF_PROVIDER --body $provider"
  fi
}

init() {
  # First run on this project: create the state bucket and its KMS key.
  if ! gcloud storage buckets describe "gs://$GCP_PROJECT_ID-tofu-state" --project="$GCP_PROJECT_ID" &> /dev/null; then
    echo "→ No state bucket yet, running infra/bootstrap.sh $GCP_PROJECT_ID"
    bash "$INFRA_DIR/bootstrap.sh" "$GCP_PROJECT_ID"
  fi

  for stack in "${STACKS[@]}"; do
    echo "→ infra/$stack"
    tofu -chdir="$INFRA_DIR/$stack" init -input=false
  done

  # In order: shared creates the GitHub login and Cloud Build the environments use.
  local applied=false
  for stack in "${STACKS[@]}"; do
    if ! is_applied "$stack"; then
      echo "→ infra/$stack has never been applied, applying it now"
      tofu -chdir="$INFRA_DIR/$stack" apply
      applied=true
    fi
  done

  set_github_variables

  if [ "$applied" = true ]; then
    cat << NEXT

Infrastructure is up. Still to do by hand:
  1. Give each secret its real value (they hold placeholders), for staging and production:
       printf '%s' '<value>' | gcloud secrets versions add DATABASE_URL_STAGING --project=$GCP_PROJECT_ID --data-file=-
     DATABASE_URL, AUTH_SECRET, API_KEY (+ _STAGING / _PRODUCTION)
  2. Commit infra/**/.terraform.lock.hcl and merge into main.
  3. Create the production branch: git push origin main:production
  4. Run Actions → Deploy Staging from main.
NEXT
  fi
}

describe() {
  echo "Project: $GCP_PROJECT_ID"
  for stack in "${STACKS[@]}"; do
    echo
    echo "━━ infra/$stack"
    if [ ! -d "$INFRA_DIR/$stack/.terraform" ]; then
      echo "Not initialized. Run: pnpm infra:init"
      continue
    fi

    resources="$(tofu -chdir="$INFRA_DIR/$stack" state list)"
    if [ -z "$resources" ]; then
      echo "Nothing applied yet."
      continue
    fi

    echo "Resources ($(echo "$resources" | wc -l | tr -d ' ')):"
    echo "$resources" | sed 's/^/  /'
    echo "Outputs:"
    tofu -chdir="$INFRA_DIR/$stack" output | sed 's/^/  /'
  done
}

case "${1:-}" in
  init) init ;;
  describe) describe ;;
  *)
    echo "Usage: $0 <init|describe>"
    exit 1
    ;;
esac
