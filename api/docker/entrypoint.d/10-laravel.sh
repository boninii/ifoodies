#!/bin/sh
# Roda a cada boot do container, antes do nginx subir.
#
# Tudo aqui depende de variáveis de ambiente, e é por isso que não está no
# Dockerfile: no build elas não existem (o EasyPanel as passa como build-arg,
# que não vira variável dentro de um RUN).
set -e

# O banco SQLite vive em storage/, que é volume — assim ele sobrevive aos
# deploys. Se ficasse em database/, o volume necessário apagaria as migrations.
DB="${DB_DATABASE:-/var/www/html/storage/app/database.sqlite}"
if [ ! -f "$DB" ]; then
    mkdir -p "$(dirname "$DB")"
    touch "$DB"
    echo "[iFoodies] banco criado em $DB"
fi

# As pastas que o Laravel exige dentro do volume. Num volume novo elas não
# existem, e a ausência delas derruba o framework no primeiro request.
mkdir -p /var/www/html/storage/framework/cache \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/logs

php artisan migrate --force
php artisan storage:link 2>/dev/null || true

# Caches do framework: aqui valem, porque o ambiente está completo.
php artisan view:cache
php artisan filament:optimize

echo "[iFoodies] pronto."
