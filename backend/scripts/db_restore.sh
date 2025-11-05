#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 </path/to/backup-YYYY-MM-DD.tar.gz>"
  exit 1
fi

ARCHIVE=$1
WORKDIR=$(mktemp -d)
tar -C "$WORKDIR" -xzf "$ARCHIVE"
EXTRACTED_DIR=$(find "$WORKDIR" -mindepth 1 -maxdepth 1 -type d | head -n1)

# Load .env if present
ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env"
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

echo "Restoring PostgreSQL..."
PGNAME=${DB_NAME:-mymental_db}
PGUSER=${DB_USER:-postgres}
PGPASSWORD=${DB_PASSWORD:-postgres}
PGHOST=${DB_HOST:-localhost}
PGPORT=${DB_PORT:-5432}
export PGPASSWORD
dropdb -h "$PGHOST" -U "$PGUSER" -p "$PGPORT" --if-exists "$PGNAME"
createdb -h "$PGHOST" -U "$PGUSER" -p "$PGPORT" "$PGNAME"
pg_restore -h "$PGHOST" -U "$PGUSER" -p "$PGPORT" -d "$PGNAME" --clean --if-exists "$EXTRACTED_DIR/postgres.dump"

echo "Restoring MongoDB..."
MONGO_HOST=${MONGO_HOST:-localhost}
MONGO_PORT=${MONGO_PORT:-27017}
MONGO_DB_NAME=${MONGO_DB_NAME:-mymental_chat}
MONGO_USER=${MONGO_USER:-}
MONGO_PASSWORD=${MONGO_PASSWORD:-}
MONGO_URI=${MONGO_URI:-}

if [ -n "$MONGO_URI" ]; then
  mongorestore --uri="$MONGO_URI" --drop --db "$MONGO_DB_NAME" "$EXTRACTED_DIR/mongo/$MONGO_DB_NAME"
else
  AUTH_ARGS=()
  if [ -n "$MONGO_USER" ] && [ -n "$MONGO_PASSWORD" ]; then
    AUTH_ARGS=( -u "$MONGO_USER" -p "$MONGO_PASSWORD" )
  fi
  mongorestore -h "$MONGO_HOST" -p "$MONGO_PORT" "${AUTH_ARGS[@]}" --drop --db "$MONGO_DB_NAME" "$EXTRACTED_DIR/mongo/$MONGO_DB_NAME"
fi

echo "Restore complete."


