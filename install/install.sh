#!/usr/bin/env bash
# setupwise installer for macOS and Linux: from a computer with nothing installed to a new
# project running locally.
#
#   curl -fsSL <url>/install.sh | bash -s my-app
#   curl -fsSL <url>/install.sh | bash -s -- my-app --name "My App" --bundle-id com.me.myapp
#
# Installs only what is missing, and says what it installs before it does:
#   - macOS: the Xcode command line tools (git), Homebrew
#   - Node.js 24 (Homebrew on macOS, fnm on Linux) and pnpm (corepack)
#   - Docker (Docker Desktop on macOS; on Linux it points you to Docker's own script)
#   - optional, with --cloud: GitHub CLI, Google Cloud CLI, OpenTofu
# Then runs `npx setupwise@latest create` with the arguments you passed.
#
# Safe to run again. Nothing runs with sudo except Homebrew's own installer, which asks.

set -euo pipefail

NODE_MAJOR=24
# The CLI to run; point it at a local tarball to test this script before publishing.
SETUPWISE_CLI="${SETUPWISE_CLI:-setupwise@latest}"
WITH_CLOUD=false
ARGS=()
for arg in "$@"; do
  case "$arg" in
    --cloud) WITH_CLOUD=true ;;
    *) ARGS+=("$arg") ;;
  esac
done

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
ok() { printf '  \033[32m✓\033[0m %s\n' "$*"; }
doing() { printf '  \033[36m+\033[0m %s\n' "$*"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$*"; }
has() { command -v "$1" > /dev/null 2>&1; }

OS="$(uname -s)"
bold "setupwise: getting this computer ready"

# --- macOS basics -------------------------------------------------------------------------
if [ "$OS" = "Darwin" ]; then
  if xcode-select -p > /dev/null 2>&1; then
    ok "Xcode command line tools"
  else
    doing "Installing the Xcode command line tools (git, compilers). A window opens: click Install."
    xcode-select --install || true
    until xcode-select -p > /dev/null 2>&1; do sleep 5; done
    ok "Xcode command line tools"
  fi

  if ! has brew; then
    for prefix in /opt/homebrew /usr/local; do
      [ -x "$prefix/bin/brew" ] && eval "$("$prefix/bin/brew" shellenv)"
    done
  fi
  if has brew; then
    ok "Homebrew"
  else
    doing "Installing Homebrew (it asks for your password)"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    for prefix in /opt/homebrew /usr/local; do
      [ -x "$prefix/bin/brew" ] && eval "$("$prefix/bin/brew" shellenv)"
    done
    ok "Homebrew"
  fi
fi

# --- git ----------------------------------------------------------------------------------
if has git; then
  ok "git"
elif [ "$OS" = "Linux" ]; then
  warn "git is missing: install it with your package manager (sudo apt install git), then run this again"
  exit 1
fi

# --- Node.js ------------------------------------------------------------------------------
node_major() { node -p 'process.versions.node.split(".")[0]' 2> /dev/null || echo 0; }
if has node && [ "$(node_major)" -ge "$NODE_MAJOR" ]; then
  ok "Node.js $(node -v)"
else
  doing "Installing Node.js $NODE_MAJOR"
  if [ "$OS" = "Darwin" ]; then
    brew install "node@$NODE_MAJOR"
    brew link --overwrite --force "node@$NODE_MAJOR"
  else
    if ! has fnm; then
      curl -fsSL https://fnm.vercel.app/install | bash -s -- --skip-shell
      export PATH="$HOME/.local/share/fnm:$PATH"
    fi
    eval "$(fnm env)"
    fnm install "$NODE_MAJOR"
    fnm default "$NODE_MAJOR"
    eval "$(fnm env)"
    warn "Node.js comes from fnm: add 'eval \"\$(fnm env)\"' to your shell profile"
  fi
  ok "Node.js $(node -v)"
fi

# --- pnpm ---------------------------------------------------------------------------------
if has pnpm; then
  ok "pnpm $(pnpm -v)"
else
  doing "Turning on pnpm (corepack)"
  corepack enable 2> /dev/null || { npm install --global corepack && corepack enable; }
  corepack prepare pnpm@10 --activate > /dev/null
  ok "pnpm $(pnpm -v)"
fi

# --- Docker -------------------------------------------------------------------------------
if has docker; then
  ok "Docker"
elif [ "$OS" = "Darwin" ]; then
  doing "Installing Docker Desktop (for the local database)"
  brew install --cask docker
  open -a Docker || true
  warn "Docker Desktop is starting: accept its terms in the window that opens"
else
  warn "Docker is missing: install it with https://get.docker.com, then run pnpm db:start in the project"
fi

# --- Cloud tools (optional) ---------------------------------------------------------------
if [ "$WITH_CLOUD" = true ]; then
  if [ "$OS" = "Darwin" ]; then
    if has gh; then ok "GitHub CLI"; else doing "Installing the GitHub CLI"; brew install gh; fi
    if has gcloud; then ok "Google Cloud CLI"; else doing "Installing the Google Cloud CLI"; brew install --cask google-cloud-sdk; fi
    if has tofu; then ok "OpenTofu"; else doing "Installing OpenTofu"; brew install opentofu; fi
  else
    has gh || warn "GitHub CLI: https://cli.github.com"
    has gcloud || warn "Google Cloud CLI: https://cloud.google.com/sdk/docs/install"
    has tofu || warn "OpenTofu: https://opentofu.org/docs/intro/install"
  fi
fi

# --- The project --------------------------------------------------------------------------
echo
bold "Creating the project"
# Reads answers from the terminal even when this script itself comes through a pipe.
if [ -t 1 ] && [ -r /dev/tty ] && [ -w /dev/tty ]; then
  npx --yes --package "$SETUPWISE_CLI" setupwise create "${ARGS[@]}" < /dev/tty
else
  npx --yes --package "$SETUPWISE_CLI" setupwise create --yes "${ARGS[@]}"
fi
