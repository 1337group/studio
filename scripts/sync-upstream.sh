#!/usr/bin/env bash
# scripts/sync-upstream.sh
# ----------------------------------------------------------------------
# Pull nexu-io/open-design upstream changes onto this Drewlo fork while
# keeping the Goa skin intact.
#
# WHY THIS SCRIPT EXISTS
#   The skin is split into "additive" files (src/styles/drewlo-skin.css,
#   src/i18n/drewlo-overrides.ts, design-systems/goa/, src/lib/goa/, etc.)
#   that NEVER conflict with upstream + a small set of "surgical" files
#   (main.tsx, i18n/index.tsx, daemon/server.js, package.json) marked
#   `// MERGE-NOTE: studio` that may need a 1-3 line manual resolve.
#
# WHAT IT DOES
#   1. Refuses to run with a dirty working tree (so nothing is lost).
#   2. Fetches upstream + branches off main as `sync-upstream-<date>`.
#   3. Merges upstream/main; on conflict, lists every MERGE-NOTE: studio
#      hit so you know exactly where to look.
#   4. After successful merge: pnpm install + pnpm build to surface any
#      breakage before the change hits hive.
#
# WHAT IT DOES NOT DO
#   - Does NOT push to origin.
#   - Does NOT deploy. Run scripts/deploy-studio.sh after PR approval.
#   - Does NOT touch hive's /opt/platform-apps/studio/.od/ — that data
#     lives only on the server and is never in scope for git operations.
#
# USAGE
#   ./scripts/sync-upstream.sh
# ----------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")/.."

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "✗ Working tree is dirty. Commit or stash before syncing upstream."
  echo "  Reason: a stashed Drewlo change replayed on top of the merge could"
  echo "  silently overwrite an upstream resolution. Start clean."
  git status --short | head -20
  exit 1
fi

if [[ "$(git rev-parse --abbrev-ref HEAD)" != "main" ]]; then
  echo "✗ Not on main. Switch to main before syncing upstream."
  exit 1
fi

SYNC_BRANCH="sync-upstream-$(date +%F)"
echo "→ Fetching upstream"
git fetch upstream --no-tags --prune

BASE=$(git merge-base main upstream/main)
NEW_COMMITS=$(git rev-list --count "${BASE}..upstream/main")
if [[ "$NEW_COMMITS" -eq 0 ]]; then
  echo "✓ Already up to date with upstream/main."
  exit 0
fi

echo "→ ${NEW_COMMITS} new upstream commit(s) since merge-base ${BASE:0:8}:"
git log --oneline "${BASE}..upstream/main"

echo "→ Branching off main as ${SYNC_BRANCH}"
git checkout -b "$SYNC_BRANCH"

echo "→ Merging upstream/main"
if ! git merge --no-edit upstream/main; then
  echo
  echo "✗ Merge has conflicts. Drewlo files marked with MERGE-NOTE: studio:"
  echo
  grep -rln "MERGE-NOTE: studio" --include="*.{js,ts,tsx,mjs,cjs,json,css,md}" \
    src daemon package.json 2>/dev/null | sed 's/^/    /'
  echo
  echo "→ Resolve conflicts, then:"
  echo "    git add <files>"
  echo "    git commit"
  echo "    pnpm install"
  echo "    pnpm build"
  echo "    # smoke-test studio.drewlo.com locally if you want"
  echo "    git push origin ${SYNC_BRANCH}"
  echo "    gh pr create --base main --head ${SYNC_BRANCH}"
  exit 2
fi

echo "→ Clean merge. Reinstalling deps + building."
pnpm install
pnpm build

echo
echo "✓ Upstream sync complete on branch ${SYNC_BRANCH}."
echo "  Next: smoke-test, push, open PR."
echo "    git push origin ${SYNC_BRANCH}"
echo "    gh pr create --base main --head ${SYNC_BRANCH}"
