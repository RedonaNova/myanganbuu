#!/usr/bin/env bash
# Nightly backup: MySQL dump + uploaded photos, kept for 14 days.
#
# Install on the VPS (runs every night at 03:30):
#   chmod +x /home/cloudmn/apps/myanganbuu/scripts/backup.sh
#   crontab -e
#   30 3 * * * /home/cloudmn/apps/myanganbuu/scripts/backup.sh >> /home/cloudmn/backups/myanganbuu/backup.log 2>&1
#
# Restore:
#   gunzip < db-YYYY-MM-DD.sql.gz | mysql -u appuser -p appdb
#   tar -xzf uploads-YYYY-MM-DD.tar.gz -C /home/cloudmn/apps/myanganbuu-data
set -euo pipefail

APP_DIR="${APP_DIR:-/home/cloudmn/apps/myanganbuu}"
BACKUP_DIR="${BACKUP_DIR:-/home/cloudmn/backups/myanganbuu}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date +%F)"

# Read DATABASE_URL and UPLOAD_DIR from the app's .env.
set -a
# shellcheck disable=SC1091
source "$APP_DIR/.env"
set +a

# mysql://user:password@host:port/database
re='^mysql://([^:]+):([^@]*)@([^:/]+)(:([0-9]+))?/([^?]+)'
if [[ ! "$DATABASE_URL" =~ $re ]]; then
  echo "Cannot parse DATABASE_URL" >&2
  exit 1
fi
DB_USER="${BASH_REMATCH[1]}"
DB_PASS="${BASH_REMATCH[2]}"
DB_HOST="${BASH_REMATCH[3]}"
DB_PORT="${BASH_REMATCH[5]:-3306}"
DB_NAME="${BASH_REMATCH[6]}"

mkdir -p "$BACKUP_DIR"
umask 077

# Password via a temporary defaults file, never on the command line.
MYCNF="$(mktemp)"
trap 'rm -f "$MYCNF"' EXIT
printf '[client]\nuser=%s\npassword=%s\nhost=%s\nport=%s\n' "$DB_USER" "$DB_PASS" "$DB_HOST" "$DB_PORT" > "$MYCNF"

mysqldump --defaults-extra-file="$MYCNF" --single-transaction --quick --no-tablespaces \
  --default-character-set=utf8mb4 "$DB_NAME" | gzip -9 > "$BACKUP_DIR/db-$STAMP.sql.gz"

UPLOADS="${UPLOAD_DIR:-/home/cloudmn/apps/myanganbuu-data/uploads}"
tar -czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" -C "$(dirname "$UPLOADS")" "$(basename "$UPLOADS")"

find "$BACKUP_DIR" -name 'db-*.sql.gz' -mtime +"$KEEP_DAYS" -delete
find "$BACKUP_DIR" -name 'uploads-*.tar.gz' -mtime +"$KEEP_DAYS" -delete

echo "$(date -Is) backup ok: $(du -sh "$BACKUP_DIR" | cut -f1) total"
