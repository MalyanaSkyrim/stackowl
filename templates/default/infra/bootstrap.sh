#!/usr/bin/env bash

# One-time setup of the Google Cloud project for OpenTofu, before the first apply.
# Staging and production share this project.
#
# Usage: infra/bootstrap.sh <gcp-project-id>
#
# Creates what OpenTofu needs before it can store state:
#   - the state bucket <project>-tofu-state (versioned, private)
#   - the KMS key that encrypts the state (keyRings/tofu/cryptoKeys/state)
# Everything else is created by the first applies of infra/shared and infra/envs/*.
# Safe to run again: existing resources are left as they are.

set -euo pipefail

PROJECT_ID="${1:-}"
REGION="europe-west1"

if [ -z "$PROJECT_ID" ]; then
  echo "Usage: $0 <gcp-project-id>"
  exit 1
fi

BUCKET="gs://$PROJECT_ID-tofu-state"

echo "→ Enabling the APIs OpenTofu needs to start"
gcloud services enable storage.googleapis.com cloudkms.googleapis.com \
  cloudresourcemanager.googleapis.com serviceusage.googleapis.com iam.googleapis.com \
  --project="$PROJECT_ID"

echo "→ State bucket $BUCKET"
if ! gcloud storage buckets describe "$BUCKET" --project="$PROJECT_ID" &> /dev/null; then
  gcloud storage buckets create "$BUCKET" --project="$PROJECT_ID" --location="$REGION" \
    --uniform-bucket-level-access --public-access-prevention
fi
gcloud storage buckets update "$BUCKET" --versioning

echo "→ KMS key for state encryption"
if ! gcloud kms keyrings describe tofu --location="$REGION" --project="$PROJECT_ID" &> /dev/null; then
  gcloud kms keyrings create tofu --location="$REGION" --project="$PROJECT_ID"
fi
if ! gcloud kms keys describe state --keyring=tofu --location="$REGION" --project="$PROJECT_ID" &> /dev/null; then
  gcloud kms keys create state --keyring=tofu --location="$REGION" --project="$PROJECT_ID" \
    --purpose=encryption --rotation-period=90d \
    --next-rotation-time="$(date -u -d '+90 days' +%Y-%m-%dT%H:%M:%SZ 2> /dev/null || date -u -v+90d +%Y-%m-%dT%H:%M:%SZ)"
fi

echo
echo "Done. Next: pnpm infra:init (applies the stacks the first time and sets the GitHub variables)"
