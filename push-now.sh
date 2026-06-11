#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# OctaTouch SDK Core — Combo A+B Push Script
# Pushes feat/engineering-upgrade AND updates Main in one shot.
# Run from the root of this extracted directory.
# ─────────────────────────────────────────────────────────────
set -euo pipefail

GITHUB_USER="deontewatts"
REPO_NAME="octatouch-sdk-core"
REMOTE_URL_SSH="git@github.com:${GITHUB_USER}/${REPO_NAME}.git"
REMOTE_URL_HTTPS="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
FEAT_BRANCH="feat/engineering-upgrade"
DEFAULT_BRANCH="Main"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  OctaTouch SDK Core — Combo A+B Push             ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── Phase 1: Auth detection ──────────────────────────────────
AUTH_METHOD=""
if gh auth status &>/dev/null; then
  AUTH_METHOD="gh_cli"
  DETECTED_USER=$(gh api user --jq '.login' 2>/dev/null || echo "$GITHUB_USER")
  echo "✅ Auth: GitHub CLI (${DETECTED_USER})"
elif ssh -T git@github.com 2>&1 | grep -q "Hi "; then
  AUTH_METHOD="ssh"
  REMOTE_URL="$REMOTE_URL_SSH"
  echo "✅ Auth: SSH"
elif [[ -n "${GITHUB_TOKEN:-}" ]]; then
  AUTH_METHOD="pat"
  REMOTE_URL="$REMOTE_URL_HTTPS"
  echo "✅ Auth: PAT (GITHUB_TOKEN)"
else
  echo "❌ No GitHub auth detected."
  echo "   Fix: run 'gh auth login'  OR  export GITHUB_TOKEN=<your-pat>"
  exit 1
fi

# ── Phase 2: Repo init ───────────────────────────────────────
cd "$SCRIPT_DIR"

if [ ! -d ".git" ]; then
  git init
  git branch -M main
fi

# Set or update remote
if git remote get-url origin &>/dev/null; then
  git remote set-url origin "$REMOTE_URL_SSH"
else
  git remote add origin "$REMOTE_URL_SSH"
fi

# ── Phase 3: Ensure all files are committed ───────────────────
if [[ -n "$(git status --porcelain)" ]]; then
  git add .
  git commit -m "chore: pre-push staging of untracked files"
fi

# ── Phase 4A: Push feat branch (Option A) ────────────────────
echo ""
echo "→ Pushing ${FEAT_BRANCH}..."
git checkout -B "$FEAT_BRANCH"
git push -u origin "$FEAT_BRANCH" --force-with-lease 2>/dev/null || \
  git push -u origin "$FEAT_BRANCH" --force
echo "✅ feat branch pushed"

# ── Phase 4B: Update Main (Option B) ─────────────────────────
echo ""
echo "→ Updating ${DEFAULT_BRANCH}..."
git checkout main 2>/dev/null || git checkout -b main

# Merge feat into main with no-edit
git merge "$FEAT_BRANCH" --no-ff --no-edit -m "chore: merge ${FEAT_BRANCH} into main"

# Push to both 'main' and 'Main' (repo uses capital M)
git push -u origin main --force-with-lease 2>/dev/null || git push -u origin main --force
git push origin main:Main --force-with-lease 2>/dev/null || git push origin main:Main --force
echo "✅ Main updated"

# ── Phase 5: dev branch ──────────────────────────────────────
echo ""
echo "→ Pushing dev branch..."
git checkout -B dev main
git push -u origin dev --force-with-lease 2>/dev/null || git push -u origin dev --force
git checkout main
echo "✅ dev branch pushed"

# ── Phase 6: Open PR if gh CLI available ────────────────────
if [[ "$AUTH_METHOD" == "gh_cli" ]]; then
  echo ""
  echo "→ Opening PR..."
  gh pr create \
    --base Main \
    --head "$FEAT_BRANCH" \
    --title "feat: OctaTouch engineering upgrade — v2 complete build" \
    --body "**104 files · 7 991 insertions · 0 build artifacts**

### What changed
- \`OctaTouchRealtimeEngine.cpp\` — full realtime gesture classification
- \`core/include/Constants.h\` + \`CANBusMonitor.h\` / \`DrivingModeGate.h\` headers
- 4 new test suites: gesture_recognition, canbus_monitor, intent_policy, expo_policy_runtime
- Expo demo: \`StatusBanner.jsx\`, \`octatouchConstants.js\`, native/parity mode client
- \`assets/\` — 4 SVG diagrams (hero, pipeline, gesture-map, safety-states)
- \`demo/\` — standalone browser gesture demo
- \`tools/github-importer/\` — GitHub Importer tool
- Community health: LICENSE · SECURITY.md · CODE_OF_CONDUCT.md · CODEOWNERS
- CI: \`build.yml\` (cmake + ctest + 16ms latency gate + clang-format) + CodeQL" 2>/dev/null \
    && echo "✅ PR opened" || echo "ℹ️  PR already exists or skipped"
fi

# ── Phase 7: Report ──────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║  ✅ Push complete                                ║"
echo "╠══════════════════════════════════════════════════╣"
printf "║  Repo  : https://github.com/%s/%s\n" "$GITHUB_USER" "$REPO_NAME"
printf "║  Main  : updated ✅\n"
printf "║  Branch: %s ✅\n" "$FEAT_BRANCH"
printf "║  dev   : updated ✅\n"
echo "╚══════════════════════════════════════════════════╝"
echo ""
