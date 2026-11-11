#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

# Clear visual formatting codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Determine deployment environment (defaults to staging)
ENVIRONMENT="${1:-${ENVIRONMENT:-staging}}"

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  echo -e "${RED}❌ Error: Invalid environment '${ENVIRONMENT}'. Allowed values: staging, production.${NC}"
  echo -e "${YELLOW}Usage: $0 [staging|production]${NC}"
  exit 1
fi

echo -e "${BLUE}===================================================${NC}"
echo -e "${BLUE}  Starter App iOS TestFlight Deployment ($ENVIRONMENT) ${NC}"
echo -e "${BLUE}===================================================${NC}"

# 1. Check OS (Must be macOS to compile iOS apps)
if [[ "$OSTYPE" != "darwin"* ]]; then
  echo -e "${RED}❌ Error: iOS builds can only be performed on macOS (darwin).${NC}"
  exit 1
fi

# Define paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MOBILE_APP_DIR="$WORKSPACE_ROOT/apps/mobile"

# Load local environment files if present
load_env_file() {
  local env_path=$1
  if [ -f "$env_path" ]; then
    echo -e "${GREEN}ℹ️ Loading environment from $(basename "$env_path")...${NC}"
    local exports
    exports=$(node -e '
      const fs = require("fs");
      const envPath = process.argv[1];
      if (!fs.existsSync(envPath)) process.exit(0);
      const content = fs.readFileSync(envPath, "utf8");
      const lines = content.split(/\r?\n/);
      let i = 0;
      while (i < lines.length) {
        let line = lines[i].trim();
        i++;
        if (!line || line.startsWith("#")) continue;
        const eqIdx = line.indexOf("=");
        if (eqIdx === -1) continue;
        const key = line.substring(0, eqIdx).trim();
        let val = line.substring(eqIdx + 1).trim();
        
        if (val.startsWith("\"")) {
          while (!val.endsWith("\"") || (val.endsWith("\\\"") && !val.endsWith("\\\\\""))) {
            if (i >= lines.length) break;
            val += "\n" + lines[i];
            i++;
          }
          val = val.substring(1, val.length - 1)
                   .replace(/\\n/g, "\n")
                   .replace(/\\"/g, "\"");
        } else if (val.startsWith("\x27")) {
          while (!val.endsWith("\x27") || (val.endsWith("\\\x27") && !val.endsWith("\\\\\x27"))) {
            if (i >= lines.length) break;
            val += "\n" + lines[i];
            i++;
          }
          val = val.substring(1, val.length - 1);
        }
        console.log(`export ${key}=\x27${val.replace(/\x27/g, "\x27\\\\\\\x27\x27")}\x27`);
      }
    ' "$env_path" 2>/dev/null || echo "")

    if [ -n "$exports" ]; then
      eval "$exports"
    fi
  fi
}

load_env_file "$MOBILE_APP_DIR/.env"
load_env_file "$MOBILE_APP_DIR/.env.local"
load_env_file "$SCRIPT_DIR/.env"


# Ask for a value that is not set in the environment or a local .env file.
prompt_secret() {
  local secret_name=$1
  local is_sensitive=$2
  local value=""

  # Prompt manually only if stdin is an interactive terminal
  if [ -t 0 ]; then
    if [ "$is_sensitive" = "true" ]; then
      read -s -p "Please enter '${secret_name}': " value
      echo "" >&2
    else
      read -p "Please enter '${secret_name}': " value
    fi
  else
    echo -e "${RED}❌ Error: '${secret_name}' is not set, and the terminal is non-interactive.${NC}" >&2
    echo -e "${YELLOW}💡 Please add '${secret_name}' to your local environment file (e.g., tooling/.env or apps/mobile/.env.local).${NC}" >&2
    exit 1
  fi

  if [ -z "$value" ]; then
    echo -e "${RED}❌ Error: '${secret_name}' cannot be empty.${NC}" >&2
    exit 1
  fi
  echo "$value"
}

# 2. Collect the Fastlane deploy secrets (only those not already set)
echo -e "\n${BLUE}🔐 Validating Deployment Secrets...${NC}"
if [ -z "$APPLE_ID" ]; then export APPLE_ID=$(prompt_secret "APPLE_ID" "false"); fi
if [ -z "$APPLE_TEAM_ID" ]; then export APPLE_TEAM_ID=$(prompt_secret "APPLE_TEAM_ID" "false"); fi
if [ -z "$APP_STORE_CONNECT_KEY_ID" ]; then export APP_STORE_CONNECT_KEY_ID=$(prompt_secret "APP_STORE_CONNECT_KEY_ID" "false"); fi
if [ -z "$APP_STORE_CONNECT_ISSUER_ID" ]; then export APP_STORE_CONNECT_ISSUER_ID=$(prompt_secret "APP_STORE_CONNECT_ISSUER_ID" "false"); fi
if [ -z "$APP_STORE_CONNECT_PRIVATE_KEY" ]; then export APP_STORE_CONNECT_PRIVATE_KEY=$(prompt_secret "APP_STORE_CONNECT_PRIVATE_KEY" "true"); fi
if [ -z "$MATCH_PASSWORD" ]; then export MATCH_PASSWORD=$(prompt_secret "FASTLANE_MATCH_PASSWORD" "true"); fi

# 3. Write the build environment next to this script (tooling/.env)
cat <<EOF > "$SCRIPT_DIR/.env"
APP_ENV=$ENVIRONMENT
ENVIRONMENT=$ENVIRONMENT

APPLE_ID='$APPLE_ID'
APPLE_TEAM_ID='$APPLE_TEAM_ID'
APP_STORE_CONNECT_KEY_ID='$APP_STORE_CONNECT_KEY_ID'
APP_STORE_CONNECT_ISSUER_ID='$APP_STORE_CONNECT_ISSUER_ID'
APP_STORE_CONNECT_PRIVATE_KEY='$APP_STORE_CONNECT_PRIVATE_KEY'
MATCH_PASSWORD='$MATCH_PASSWORD'
MATCH_GIT_URL='${MATCH_GIT_URL:-}'
EOF
echo -e "${GREEN}✅ Generated tooling/.env successfully for '$ENVIRONMENT'.${NC}"

# 4. Install Monorepo Dependencies
echo -e "\n${BLUE}📦 Installing monorepo dependencies...${NC}"
cd "$WORKSPACE_ROOT"
pnpm install --frozen-lockfile

# 5. Run Expo Prebuild
echo -e "\n${BLUE}⚙️ Generating iOS Native Project (Expo Prebuild)...${NC}"
cd "$MOBILE_APP_DIR"
EXPO_USE_PNPM=1 MOBILE_DEPLOY=1 pnpm exec expo prebuild --platform ios --no-install

# 6. Apply modular headers fix to generated Podfile
echo -e "\n${BLUE}🔧 Configuring Podfile for modular headers...${NC}"
ruby -e "lines = File.read('ios/Podfile'); File.write('ios/Podfile', \"use_modular_headers!\n\n\" + lines)"

# 7. Setup Ruby Bundler and Install Pods
echo -e "\n${BLUE}💎 Installing Ruby gems and CocoaPods...${NC}"
bundle install
cd ios
bundle exec pod install
cd ..

# 8. Trigger Fastlane Deployment
echo -e "\n${BLUE}🚀 Deploying to App Store Connect / TestFlight via Fastlane ($ENVIRONMENT)...${NC}"
export RCT_NO_LAUNCH_PACKAGER=1
bundle exec fastlane deploy

echo -e "\n${GREEN}🎉 Deployment process completed successfully for '$ENVIRONMENT'!${NC}"
