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
#     2. Rsyncs ONLY into specific subfolders (dist/, daemon/, public/),
#        not the studio root, so .od/ is mathematically out of scope
#     3. Adds belt+suspenders --exclude='.od' --exclude='.od/**' on every
#        rsync as defense against future subfolder-scope drift
#
#   If you ever need a wider deploy (e.g. node_modules, package.json),
#   add a NEW targeted block below — never collapse to a single root rsync.
#
# WHAT IT DOES
#   1. ./scripts/backup-studio-od.sh        ← snapshot user data
#   2. pnpm build                           ← Vite produces dist/
#   3. rsync dist/ → hive:/opt/platform-apps/studio/dist/
#   4. rsync daemon/ → hive:/opt/platform-apps/studio/daemon/
#   5. rsync public/ → hive:/opt/platform-apps/studio/public/
#   6. systemctl restart platform-app@studio
#   7. health-check the daemon
#
# USAGE
#   ./scripts/deploy-studio.sh
#   ./scripts/deploy-studio.sh --skip-backup   # for quick iterations
# ----------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")/.."
SSH="${HOME}/Documents/AI/scripts/ssh-to.sh"
[[ -x "$SSH" ]] || SSH="ssh-to.sh"
HOST="hive@172.16.1.77"
APP_DIR="/opt/platform-apps/studio"

SKIP_BACKUP=false
[[ "${1:-}" == "--skip-backup" ]] && SKIP_BACKUP=true

if ! $SKIP_BACKUP; then
  echo "→ [1/7] Backing up .od/ on hive (use --skip-backup to bypass)"
  ./scripts/backup-studio-od.sh
fi

echo "→ [2/7] Building Studio frontend"
pnpm build

echo "→ [3/7] Staging dist/ on hive"
rsync -a --delete \
  --exclude='.od' --exclude='.od/**' \
  dist/ "${HOST}:/tmp/studio-dist/"

echo "→ [4/7] Staging daemon/ on hive"
rsync -a \
  --exclude='.od' --exclude='.od/**' \
  daemon/ "${HOST}:/tmp/studio-daemon/"

echo "→ [5/7] Staging public/ on hive"
rsync -a \
  --exclude='.od' --exclude='.od/**' \
  public/ "${HOST}:/tmp/studio-public/"

echo "→ [6/7] Promoting + restart on hive"
"$SSH" hive "
  sudo rsync -a --delete --exclude='.od' --exclude='.od/**' /tmp/studio-dist/   ${APP_DIR}/dist/   && \
  sudo rsync -a            --exclude='.od' --exclude='.od/**' /tmp/studio-daemon/ ${APP_DIR}/daemon/ && \
  sudo rsync -a            --exclude='.od' --exclude='.od/**' /tmp/studio-public/ ${APP_DIR}/public/ && \
  sudo systemctl restart platform-app@studio && \
  sleep 3 && \
  systemctl is-active platform-app@studio
"

echo "→ [7/7] Health-checking studio.drewlo.com"
sleep 1
curl -fsS -o /dev/null -w "  https://studio.drewlo.com/api/health = %{http_code}\n" \
  https://studio.drewlo.com/api/health || {
    echo "✗ Health check failed. Check journalctl -u platform-app@studio."
    exit 1
  }

echo "✓ Studio deploy complete."
