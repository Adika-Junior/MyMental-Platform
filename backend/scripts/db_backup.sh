#!/usr/bin/env bash
set -euo pipefail

# Load .env if present
ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env"
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

BACKUP_DIR=${BACKUP_DIR:-"/home/j_view/Projects/MyMental-Platform/backups/$(date +%F)"}
mkdir -p "$BACKUP_DIR"

echo "Backing up PostgreSQL..."
PGNAME=${DB_NAME:-mymental_db}
PGUSER=${DB_USER:-postgres}
PGPASSWORD=${DB_PASSWORD:-postgres}
PGHOST=${DB_HOST:-localhost}
PGPORT=${DB_PORT:-5432}
export PGPASSWORD
pg_dump -h "$PGHOST" -U "$PGUSER" -p "$PGPORT" -d "$PGNAME" -Fc -f "$BACKUP_DIR/postgres.dump"

echo "Backing up MongoDB..."
MONGO_HOST=${MONGO_HOST:-localhost}
MONGO_PORT=${MONGO_PORT:-27017}
MONGO_DB_NAME=${MONGO_DB_NAME:-mymental_chat}
MONGO_USER=${MONGO_USER:-}
MONGO_PASSWORD=${MONGO_PASSWORD:-}

MONGO_URI=${MONGO_URI:-}
if [ -n "$MONGO_URI" ]; then
  mongodump --uri="$MONGO_URI" --db "$MONGO_DB_NAME" --out "$BACKUP_DIR/mongo"
else
  AUTH_ARGS=()
  if [ -n "$MONGO_USER" ] && [ -n "$MONGO_PASSWORD" ]; then
    AUTH_ARGS=( -u "$MONGO_USER" -p "$MONGO_PASSWORD" )
  fi
  mongodump -h "$MONGO_HOST" -p "$MONGO_PORT" "${AUTH_ARGS[@]}" --db "$MONGO_DB_NAME" --out "$BACKUP_DIR/mongo"
fi

echo "Compressing..."
tar -C "$BACKUP_DIR/.." -czf "$BACKUP_DIR.tar.gz" "$(basename "$BACKUP_DIR")"
echo "Backup complete: $BACKUP_DIR.tar.gz"


