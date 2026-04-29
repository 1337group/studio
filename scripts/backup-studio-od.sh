#!/usr/bin/env bash
# scripts/backup-studio-od.sh
# ----------------------------------------------------------------------
# Snapshot Studio's runtime data (the .od/ directory on hive) to a
# timestamped tarball under /var/backups/studio/.
#
# WHAT'S IN .od/
#   - app.sqlite + app.sqlite-wal + app.sqlite-shm
#       projects · conversations · messages · tabs · templates
#   - projects/<id>/    (per-project agent artifacts — actual files
#                        the agent has Write'd into the project workspace)
#   - artifacts/        (saved one-off renders)
#
# WHEN TO RUN
#   - Before any deploy that touches the studio root directory.
#   - Before any /opt/platform-apps/studio/ rsync that's wider than
#     `dist/` alone (in practice: never widen the rsync scope).
#   - On a nightly systemd timer once configured.
#
# RECOVERY
#   On hive:
#     sudo systemctl stop platform-app@studio
#     sudo tar xzf /var/backups/studio/od-YYYYMMDD-HHMMSS.tar.gz \
#                  -C /opt/platform-apps/studio/
#     sudo systemctl start platform-app@studio
#
# USAGE
#   ./scripts/backup-studio-od.sh                  # backup + report size
#   ./scripts/backup-studio-od.sh --prune-older-than 30  # keep 30 days
# ----------------------------------------------------------------------
set -euo pipefail

PRUNE_DAYS="${1:-}"
SSH="${HOME}/Documents/AI/scripts/ssh-to.sh"
[[ -x "$SSH" ]] || SSH="ssh-to.sh"

STAMP=$(date +%Y%m%d-%H%M%S)
TAR_NAME="od-${STAMP}.tar.gz"

"$SSH" hive "sudo mkdir -p /var/backups/studio && \
  sudo tar czf /var/backups/studio/${TAR_NAME} \
       -C /opt/platform-apps/studio .od && \
  sudo ls -la /var/backups/studio/${TAR_NAME} && \
  echo --- && \
  echo 'Latest 5 backups:' && \
  sudo ls -ltrh /var/backups/studio/ | tail -5"

if [[ "${PRUNE_DAYS}" == "--prune-older-than" ]]; then
  KEEP=${2:-30}
  "$SSH" hive "sudo find /var/backups/studio -name 'od-*.tar.gz' -mtime +${KEEP} -delete && \
    echo 'Pruned backups older than ${KEEP} days.'"
fi

echo "✓ Backup complete: /var/backups/studio/${TAR_NAME}"
