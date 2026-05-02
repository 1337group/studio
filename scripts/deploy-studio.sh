#!/usr/bin/env bash
# scripts/deploy-studio.sh
# ----------------------------------------------------------------------
# Build + deploy Studio to hive:/opt/platform-apps/studio/.
#
# DATA SAFETY
#   The deployed `.od/` directory at /opt/platform-apps/studio/.od/ holds
#   ALL user data (projects · conversations · messages · per-project
#   artifacts). This script:
#     1. Snapshots .od/ to /var/backups/studio/ BEFORE touching anything
#     2. Rsyncs ONLY into specific subfolders, never the studio root,
#        so .od/ is mathematically out of scope
#     3. Adds belt+suspenders --exclude='.od' --exclude='.od/**' on every
#        rsync as defense against future subfolder-scope drift
#
#   If you ever need a wider deploy (e.g. workspace packages), add a NEW
#   targeted block below — never collapse to a single root rsync.
#
# WHAT IT DOES (post-PR-#118 monorepo paths, locked 2026-05-02)
#   1. ./scripts/backup-studio-od.sh                  ← snapshot user data
#   2. pnpm -r --if-present run build                 ← Next.js out/ + tsc dist/
#   3. rsync apps/web/out/        → hive:apps/web/out/
#   4. rsync apps/web/public/     → hive:apps/web/public/
#   5. rsync apps/daemon/dist/    → hive:apps/daemon/dist/
#   6. rsync apps/daemon/package.json → hive:apps/daemon/package.json
#      (so future `pnpm install` keeps overlay deps: jose, pino-*, sdk)
#   7. systemctl restart platform-app@studio
#   8. health-check the daemon
#
# USAGE
#   ./scripts/deploy-studio.sh
#   ./scripts/deploy-studio.sh --skip-backup   # for quick iterations
#   ./scripts/deploy-studio.sh --skip-build    # already-built, just push
# ----------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")/.."
SSH="${HOME}/Documents/AI/scripts/ssh-to.sh"
[[ -x "$SSH" ]] || SSH="ssh-to.sh"
HOST="hive@172.16.1.77"
APP_DIR="/opt/platform-apps/studio"

SKIP_BACKUP=false
SKIP_BUILD=false
for arg in "$@"; do
  case "$arg" in
    --skip-backup) SKIP_BACKUP=true ;;
    --skip-build)  SKIP_BUILD=true ;;
    *) echo "unknown flag: $arg" >&2; exit 64 ;;
  esac
done

if ! $SKIP_BACKUP; then
  echo "→ [1/8] Backing up .od/ on hive (use --skip-backup to bypass)"
  ./scripts/backup-studio-od.sh
fi

if ! $SKIP_BUILD; then
  echo "→ [2/8] Building Studio workspace (web + daemon + tools)"
  pnpm -r --if-present run build
fi

echo "→ [3/8] Staging apps/web/out/ on hive (Next.js static export)"
rsync -a --delete \
  --exclude='.od' --exclude='.od/**' \
  apps/web/out/ "${HOST}:/tmp/studio-out/"

echo "→ [4/8] Staging apps/web/public/ on hive"
rsync -a \
  --exclude='.od' --exclude='.od/**' \
  apps/web/public/ "${HOST}:/tmp/studio-public/"

echo "→ [5/8] Staging apps/daemon/dist/ on hive"
rsync -a --delete \
  --exclude='.od' --exclude='.od/**' \
  apps/daemon/dist/ "${HOST}:/tmp/studio-daemon-dist/"

echo "→ [6/8] Staging apps/daemon/package.json on hive (overlay deps)"
rsync -a apps/daemon/package.json "${HOST}:/tmp/studio-daemon-package.json"

echo "→ [7/8] Promoting + restart on hive"
"$SSH" hive "
  sudo rsync -a --delete --exclude='.od' --exclude='.od/**' /tmp/studio-out/         ${APP_DIR}/apps/web/out/         && \
  sudo rsync -a            --exclude='.od' --exclude='.od/**' /tmp/studio-public/      ${APP_DIR}/apps/web/public/      && \
  sudo rsync -a --delete --exclude='.od' --exclude='.od/**' /tmp/studio-daemon-dist/ ${APP_DIR}/apps/daemon/dist/     && \
  sudo install -o hive -g hive -m 644 /tmp/studio-daemon-package.json ${APP_DIR}/apps/daemon/package.json && \
  sudo systemctl restart platform-app@studio && \
  sleep 3 && \
  systemctl is-active platform-app@studio
"

echo "→ [8/8] Health-checking studio.drewlo.com"
sleep 1
curl -fsS -o /dev/null -w "  https://studio.drewlo.com/api/health = %{http_code}\n" \
  https://studio.drewlo.com/api/health || {
    echo "✗ Health check failed. Check journalctl -u platform-app@studio."
    exit 1
  }

echo "✓ Studio deploy complete."
