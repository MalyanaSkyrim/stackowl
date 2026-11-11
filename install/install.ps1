# StackOwl installer for Windows: from a computer with nothing installed to a new project
# running locally. In PowerShell:
#
#   irm https://raw.githubusercontent.com/MalyanaSkyrim/stackowl/main/install/install.ps1 | iex
#   & ([scriptblock]::Create((irm https://raw.githubusercontent.com/MalyanaSkyrim/stackowl/main/install/install.ps1))) my-app --name "My App"
#
# Installs only what is missing, with winget: Git, Node.js 24 LTS, pnpm (corepack) and Docker
# Desktop; with -Cloud also the GitHub CLI, the Google Cloud CLI and OpenTofu. Then runs
# `npx stackowl@latest create` with the arguments you passed. The iPhone app needs a Mac to
# build; everything else works on Windows.

param(
  [switch]$Cloud,
  [Parameter(ValueFromRemainingArguments = $true)][string[]]$CreateArgs
)

$ErrorActionPreference = 'Stop'
$NodeMajor = 24
# The CLI to run; point it at a local tarball to test this script before publishing.
$Cli = if ($env:STACKOWL_CLI) { $env:STACKOWL_CLI } else { 'stackowl@latest' }

function Ok($text) { Write-Host "  ✓ $text" -ForegroundColor Green }
function Doing($text) { Write-Host "  + $text" -ForegroundColor Cyan }
function Warn($text) { Write-Host "  ! $text" -ForegroundColor Yellow }
function Has($command) { [bool](Get-Command $command -ErrorAction SilentlyContinue) }
function Refresh-Path {
  $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
    [Environment]::GetEnvironmentVariable('Path', 'User')
}
function Install-Winget($id, $name) {
  Doing "Installing $name"
  winget install --id $id --exact --silent --accept-package-agreements --accept-source-agreements | Out-Null
  Refresh-Path
}

Write-Host 'StackOwl: getting this computer ready' -ForegroundColor White

if (-not (Has 'winget')) {
  Warn 'winget is missing: install "App Installer" from the Microsoft Store, then run this again'
  exit 1
}

if (Has 'git') { Ok 'git' } else { Install-Winget 'Git.Git' 'Git'; Ok 'git' }

$nodeOk = $false
if (Has 'node') { $nodeOk = [int](node -p 'process.versions.node.split(".")[0]') -ge $NodeMajor }
if ($nodeOk) { Ok "Node.js $(node -v)" } else { Install-Winget 'OpenJS.NodeJS.LTS' "Node.js $NodeMajor"; Ok "Node.js $(node -v)" }

if (Has 'pnpm') { Ok "pnpm $(pnpm -v)" } else {
  Doing 'Turning on pnpm (corepack)'
  corepack enable
  corepack prepare pnpm@10 --activate | Out-Null
  Refresh-Path
  Ok "pnpm $(pnpm -v)"
}

if (Has 'docker') { Ok 'Docker' } else {
  Install-Winget 'Docker.DockerDesktop' 'Docker Desktop (for the local database)'
  Warn 'Start Docker Desktop once and accept its terms; it may ask to restart Windows'
}

if ($Cloud) {
  if (Has 'gh') { Ok 'GitHub CLI' } else { Install-Winget 'GitHub.cli' 'the GitHub CLI' }
  if (Has 'gcloud') { Ok 'Google Cloud CLI' } else { Install-Winget 'Google.CloudSDK' 'the Google Cloud CLI' }
  if (Has 'tofu') { Ok 'OpenTofu' } else { Install-Winget 'OpenTofu.Tofu' 'OpenTofu' }
}

Write-Host ''
Write-Host 'Creating the project' -ForegroundColor White
npx --yes --package $Cli stackowl create @CreateArgs
