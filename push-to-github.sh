#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# OctaTouch SDK — A+B combo push script
# Detects auth, applies upgrade to existing repo OR creates it fresh,
# pushes main + dev branches, sets default branch.
# Run: bash push-to-github.sh
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

REPO_NAME="octatouch-sdk-core"
GITHUB_USER="deontewatts"
REMOTE_URL_HTTPS="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
REMOTE_URL_SSH="git@github.com:${GITHUB_USER}/${REPO_NAME}.git"
DESCRIPTION="Cross-platform gesture engine — 8-finger vocabulary, 16ms latency budget, automotive + iOS + Expo adapters"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
die()  { echo -e "${RED}❌ $1${NC}"; exit 1; }

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  OctaTouch SDK — GitHub Push (A+B combo)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── Phase 1: Auth detection ──────────────────────────────────────────────────
AUTH_METHOD=""
REMOTE_URL=""

if gh auth status &>/dev/null; then
  AUTH_METHOD="gh_cli"
  REMOTE_URL="$REMOTE_URL_HTTPS"
  GITHUB_USER=$(gh api user --jq '.login' 2>/dev/null || echo "$GITHUB_USER")
  log "Auth: gh CLI (user: $GITHUB_USER)"
elif ssh -T git@github.com 2>&1 | grep -q "Hi "; then
  AUTH_METHOD="ssh"
  REMOTE_URL="$REMOTE_URL_SSH"
  log "Auth: SSH key"
elif [[ -n "${GITHUB_TOKEN:-}" ]]; then
  AUTH_METHOD="pat"
  REMOTE_URL="https://${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"
  log "Auth: GITHUB_TOKEN env var"
else
  die "No GitHub auth found.\nOptions:\n  1. Run: gh auth login\n  2. Export: GITHUB_TOKEN=<your-pat>\n  3. Add SSH key to GitHub"
fi

# ── Phase 2: Init repo from this directory ──────────────────────────────────
cd "$SCRIPT_DIR"

# Remove push script itself from the commit
if [[ -f "push-to-github.sh" ]]; then
  # Add to .gitignore if not already there
  grep -qxF "push-to-github.sh" .gitignore 2>/dev/null || echo "push-to-github.sh" >> .gitignore
fi

if [[ ! -d ".git" ]]; then
  git init
  git config user.email "deontewatts@github.com"
  git config user.name "Deonte Watts"
  log "Git initialized"
fi

git branch -M main

# ── Phase 3: Stage + commit if dirty ─────────────────────────────────────────
if [[ -n "$(git status --porcelain)" ]]; then
  git add .
  git commit -m "feat: engineering upgrade — tests, demo, iOS bridge, SVG assets, community health files

Core additions:
- OctaTouchRealtimeEngine.cpp — full realtime gesture classification
- core/include/Constants.h + integration public headers
- integrations/in-vehicle-hmi/CANBusMonitor.h + DrivingModeGate.h

Tests (4 new suites):
- tests/unit/gesture_recognition_test.cpp
- tests/unit/canbus_monitor_test.cpp
- tests/unit/intent_policy_test.cpp
- tests/runtime/expo_policy_runtime_smoke.mjs

Expo demo: StatusBanner.jsx, octatouchConstants.js, native/parity engine client
Assets: assets/{hero,pipeline,gesture-map,safety-states}.svg
Tools: tools/github-importer/index.html
CI: .github/workflows/build.yml (cmake+ctest+latency+clang-format)
Community health: LICENSE, SECURITY.md, CODE_OF_CONDUCT.md, CODEOWNERS"
  log "Committed: $(git rev-parse --short HEAD)"
else
  log "Working tree clean — using existing commit $(git rev-parse --short HEAD)"
fi

# ── Phase 4: Create or validate remote ───────────────────────────────────────
if git remote get-url origin &>/dev/null; then
  git remote set-url origin "$REMOTE_URL"
  log "Remote 'origin' updated"
else
  # Try to create repo via gh CLI, else assume it exists
  if [[ "$AUTH_METHOD" == "gh_cli" ]]; then
    gh repo create "${GITHUB_USER}/${REPO_NAME}" \
      --public \
      --description "$DESCRIPTION" \
      --source=. \
      --remote=origin \
      --push=false 2>/dev/null \
      && log "Remote repo created at github.com/${GITHUB_USER}/${REPO_NAME}" \
      || warn "Repo may already exist — continuing with existing remote"
    git remote set-url origin "$REMOTE_URL"
  else
    git remote add origin "$REMOTE_URL"
    log "Remote 'origin' added"
  fi
fi

# ── Phase 5: Branch structure ─────────────────────────────────────────────────
git checkout -b dev 2>/dev/null || git checkout dev
git checkout main
log "Branches: main + dev ready"

# ── Phase 6: Push (A+B combo) ─────────────────────────────────────────────────
echo ""
echo "⬆️  Pushing main → origin/main (force-with-lease)..."
git push --force-with-lease -u origin main

echo "⬆️  Pushing dev → origin/dev..."
git push -u origin dev 2>/dev/null || git push --force-with-lease -u origin dev

# Rename legacy 'Main' (capital M) → 'main' on GitHub if gh CLI available
if [[ "$AUTH_METHOD" == "gh_cli" ]]; then
  gh repo edit "${GITHUB_USER}/${REPO_NAME}" --default-branch main 2>/dev/null \
    && log "Default branch set to 'main'" \
    || warn "Could not set default branch (may need manual update in GitHub Settings)"
fi

# ── Phase 7: Verify ───────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [[ "$AUTH_METHOD" == "gh_cli" ]]; then
  gh repo view "${GITHUB_USER}/${REPO_NAME}" \
    --json name,visibility,defaultBranchRef,url \
    --jq '"✅ \(.url)\n   Visibility : \(.visibility)\n   Default    : \(.defaultBranchRef.name)"' \
    2>/dev/null || true
else
  echo -e "${GREEN}✅ Repo: https://github.com/${GITHUB_USER}/${REPO_NAME}${NC}"
fi
echo "   Branches   : main (default), dev"
echo "   Auth used  : $AUTH_METHOD"
echo "   Commit     : $(git rev-parse --short HEAD)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
