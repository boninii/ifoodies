#!/bin/sh
# Roda a cada boot do container, antes do nginx subir.
set -e

# O banco SQLite vive em storage/, que é volume — assim ele sobrevive aos
# deploys. Se ficasse em database/, o volume necessário apagaria as migrations.
DB="${DB_DATABASE:-/var/www/html/storage/app/database.sqlite}"
if [ ! -f "$DB" ]; then
    mkdir -p "$(dirname "$DB")"
    touch "$DB"
    echo "[iFoodies] banco criado em $DB"
fi

php artisan migrate --force
php artisan storage:link || true

echo "[iFoodies] pronto."
