#!/usr/bin/env bash
# cspell:ignore keygen subshell Fastfile rjson

# One-time iOS signing setup for .github/workflows/deploy-mobile.yml, run from
# the repo root through `pnpm mobile:signing`. Safe to run again.
#
# Fastlane Match keeps the signing certificate and profiles in a private
# GitHub repo (MATCH_REPO, by default <this repo>-certificates; create it empty
# first). Several apps of the same Apple team can share one.
#
# What it does:
#   1. reads the Apple and Match values from the root .env, or the file in
#      SIGNING_ENV_SOURCE, and prompts for any that are missing
#   2. creates the `production` GitHub environment of this repo
#   3. adds a read-only deploy key to the certificates repo for CI, and stores
#      its private half as the SSH_PRIVATE_KEY secret (never kept on disk)
#   4. sets the other secrets and the APP_BUNDLE_ID variable in `production`
#   5. runs `fastlane match appstore` to create (or rebuild) the App Store profile
#
# Stays manual: registering the App ID (with Sign in with Apple) in the Apple
# Developer portal before running this, and creating the app in App Store Connect.
#
# Overrides: SIGNING_ENV_SOURCE, MATCH_REPO, APP_BUNDLE_ID.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SIGNING_ENV_SOURCE="${SIGNING_ENV_SOURCE:-$ROOT_DIR/.env}"
APP_BUNDLE_ID="${APP_BUNDLE_ID:-com.example.starterapp}"
DEPLOY_KEY_TITLE="starter-app CI (read-only)"
ENVIRONMENT="production"

# ---------------------------------------------------------------------------
# Checks
# ---------------------------------------------------------------------------

if [[ "$OSTYPE" != darwin* ]]; then
  echo "iOS signing needs macOS."
  exit 1
fi

for tool in gh ssh-keygen ruby bundle; do
  if ! command -v "$tool" &> /dev/null; then
    echo "$tool is not installed."
    exit 1
  fi
done

if ! gh auth status &> /dev/null; then
  echo "gh is not logged in. Run: gh auth login"
  exit 1
fi

APP_REPO="$(cd "$ROOT_DIR" && gh repo view --json nameWithOwner -q .nameWithOwner)"
MATCH_REPO="${MATCH_REPO:-$APP_REPO-certificates}"

if ! gh repo view "$MATCH_REPO" &> /dev/null; then
  echo "Can't find the certificates repo $MATCH_REPO. Create it (private, empty):"
  echo "  gh repo create $MATCH_REPO --private"
  echo "or set MATCH_REPO to use another one."
  exit 1
fi

echo "App repo:          $APP_REPO"
echo "Certificates repo: $MATCH_REPO"
echo "Bundle ID:         $APP_BUNDLE_ID"
echo
echo "Before going on, register the App ID $APP_BUNDLE_ID in the Apple Developer"
echo "portal (with Sign in with Apple): match needs it."
read -r -p "Continue? [y/N] " answer
[[ "$answer" =~ ^[Yy]$ ]] || exit 0

# Removed on exit: the deploy key and the App Store Connect key file.
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

# ---------------------------------------------------------------------------
# Values
# ---------------------------------------------------------------------------

# Reads one key from SIGNING_ENV_SOURCE in a subshell, so nothing else in that
# file leaks into this script or into fastlane.
read_source_value() {
  [ -f "$SIGNING_ENV_SOURCE" ] || return 0
  (
    set +u
    # shellcheck disable=SC1090
    . "$SIGNING_ENV_SOURCE" > /dev/null 2>&1
    printf '%s' "${!1-}"
  )
}

# Sets the variable from the environment, else the source file, else a prompt.
load_value() {
  local name=$1 hidden=$2 value
  value="${!name-}"
  [ -n "$value" ] || value="$(read_source_value "$name")"
  if [ -z "$value" ]; then
    if [ "$hidden" = true ]; then
      read -r -s -p "$name: " value
      echo
    else
      read -r -p "$name: " value
    fi
  fi
  if [ -z "$value" ]; then
    echo "$name is required."
    exit 1
  fi
  printf -v "$name" '%s' "$value"
}

if [ -f "$SIGNING_ENV_SOURCE" ]; then
  echo "→ Reading values from $SIGNING_ENV_SOURCE"
else
  echo "→ $SIGNING_ENV_SOURCE not found: asking for each value"
fi

load_value APPLE_ID false
load_value APPLE_TEAM_ID false
load_value APP_STORE_CONNECT_KEY_ID false
load_value APP_STORE_CONNECT_ISSUER_ID false
load_value MATCH_PASSWORD true

# The .p8 key is multi-line, so a prompt asks for the file instead.
APP_STORE_CONNECT_PRIVATE_KEY="${APP_STORE_CONNECT_PRIVATE_KEY:-$(read_source_value APP_STORE_CONNECT_PRIVATE_KEY)}"
if [ -z "$APP_STORE_CONNECT_PRIVATE_KEY" ]; then
  read -r -p "Path to the App Store Connect .p8 key: " key_path
  APP_STORE_CONNECT_PRIVATE_KEY="$(cat "${key_path/#\~/$HOME}")"
fi

# ---------------------------------------------------------------------------
# GitHub
# ---------------------------------------------------------------------------

set_secret() {
  printf '%s' "$2" | gh secret set "$1" --env "$ENVIRONMENT" --repo "$APP_REPO"
}

gh api -X PUT "repos/$APP_REPO/environments/$ENVIRONMENT" > /dev/null
echo "→ GitHub environment $ENVIRONMENT is ready"

if gh repo deploy-key list --repo "$MATCH_REPO" --json title -q '.[].title' | grep -qxF "$DEPLOY_KEY_TITLE"; then
  echo "→ Deploy key \"$DEPLOY_KEY_TITLE\" already exists: SSH_PRIVATE_KEY left as it is"
else
  ssh-keygen -q -t ed25519 -N "" -C "$DEPLOY_KEY_TITLE" -f "$TMP_DIR/deploy_key"
  gh repo deploy-key add "$TMP_DIR/deploy_key.pub" --repo "$MATCH_REPO" --title "$DEPLOY_KEY_TITLE" > /dev/null
  gh secret set SSH_PRIVATE_KEY --env "$ENVIRONMENT" --repo "$APP_REPO" < "$TMP_DIR/deploy_key"
  echo "→ Added a read-only deploy key to $MATCH_REPO and stored it as SSH_PRIVATE_KEY"
fi

set_secret APPLE_ID "$APPLE_ID"
set_secret APPLE_TEAM_ID "$APPLE_TEAM_ID"
set_secret APP_STORE_CONNECT_KEY_ID "$APP_STORE_CONNECT_KEY_ID"
set_secret APP_STORE_CONNECT_ISSUER_ID "$APP_STORE_CONNECT_ISSUER_ID"
set_secret APP_STORE_CONNECT_PRIVATE_KEY "$APP_STORE_CONNECT_PRIVATE_KEY"
set_secret FASTLANE_MATCH_PASSWORD "$MATCH_PASSWORD"
# CI clones over SSH with the deploy key.
set_secret MATCH_GIT_URL "git@github.com:$MATCH_REPO.git"
gh variable set APP_BUNDLE_ID --env "$ENVIRONMENT" --repo "$APP_REPO" --body "$APP_BUNDLE_ID"
echo "→ Secrets and APP_BUNDLE_ID are set in $ENVIRONMENT"

# ---------------------------------------------------------------------------
# First match run
# ---------------------------------------------------------------------------

cd "$ROOT_DIR/apps/mobile"

# Use the Ruby in .ruby-version (CI's 3.3), not Homebrew's: bundler can't write
# to Homebrew Ruby's gem plugins folder. rbenv installs it on the first run.
RUBY_VERSION_WANTED="$(cat .ruby-version)"
if command -v rbenv &> /dev/null; then
  rbenv install --skip-existing "$RUBY_VERSION_WANTED"
  export PATH="$(rbenv root)/shims:$PATH"
  gem list -i bundler &> /dev/null || gem install bundler --no-document
elif [[ "$(ruby -e 'print RUBY_VERSION')" != "$RUBY_VERSION_WANTED"* ]]; then
  echo "Ruby $RUBY_VERSION_WANTED is needed (apps/mobile/.ruby-version). Install it with rbenv or mise."
  exit 1
fi
echo "→ Using Ruby $(ruby -e 'print RUBY_VERSION')"

if ! bundle install --quiet; then
  echo "bundle install failed (Ruby $(ruby -e 'print RUBY_VERSION'))."
  exit 1
fi

# The App Store Connect key signs fastlane in without an Apple ID password or
# 2FA. Like the Fastfile, accept the key as PEM or base64.
API_KEY_JSON="$TMP_DIR/api_key.json"
KEY_ID="$APP_STORE_CONNECT_KEY_ID" ISSUER_ID="$APP_STORE_CONNECT_ISSUER_ID" \
  KEY="$APP_STORE_CONNECT_PRIVATE_KEY" ruby -rjson -e '
    key = ENV["KEY"]
    File.write(ARGV[0], JSON.generate(
      key_id: ENV["KEY_ID"],
      issuer_id: ENV["ISSUER_ID"],
      key: key,
      is_key_content_base64: !key.include?("-----BEGIN"),
      in_house: false
    ))
  ' "$API_KEY_JSON"

# One App Store profile per bundle id; add app extensions here, comma-separated.
# --force rebuilds them, so a profile made before a capability was turned on picks it up.
APP_IDENTIFIERS="$APP_BUNDLE_ID"
echo "→ Running fastlane match appstore for $APP_IDENTIFIERS"
# Locally the certificates repo is cloned over HTTPS with the gh login, so no
# personal SSH key is needed and the global git config is left alone.
if ! MATCH_GIT_URL="https://github.com/$MATCH_REPO.git" \
  MATCH_GIT_BASIC_AUTHORIZATION="$(printf 'x-access-token:%s' "$(gh auth token)" | base64)" \
  MATCH_PASSWORD="$MATCH_PASSWORD" \
  bundle exec fastlane match appstore \
  --app_identifier "$APP_IDENTIFIERS" \
  --force \
  --team_id "$APPLE_TEAM_ID" \
  --api_key_path "$API_KEY_JSON"; then
  echo
  echo "match failed. If it can't find an App ID, register it in the Apple Developer"
  echo "portal ($APP_IDENTIFIERS), then run pnpm mobile:signing again."
  exit 1
fi

echo
echo "Done. $MATCH_REPO now holds the App Store profiles for $APP_IDENTIFIERS, and"
echo "$APP_REPO has everything deploy-mobile.yml needs. Still manual: the app in"
echo "App Store Connect."
