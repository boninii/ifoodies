#!/bin/sh
# Roda a cada boot do container, antes do nginx subir.
#
# Tudo aqui depende de variáveis de ambiente, e é por isso que não está no
# Dockerfile: no build elas não existem (o EasyPanel as passa como build-arg,
# que não vira variável dentro de um RUN).
set -e

STORAGE=/var/www/html/storage
DB="${DB_DATABASE:-$STORAGE/app/database.sqlite}"

# As pastas que o Laravel exige dentro do volume. Num volume novo elas não
# existem, e a ausência derruba o framework no primeiro request.
mkdir -p "$STORAGE/framework/cache" "$STORAGE/framework/sessions" \
         "$STORAGE/framework/views" "$STORAGE/logs" "$(dirname "$DB")" 2>/dev/null || true

# Antes de qualquer coisa, provar que dá para escrever no volume. Falhar aqui
# com uma mensagem clara é muito melhor do que morrer num `touch: Permission
# denied` solto, que não diz a quem pertence o quê nem o que fazer.
if ! touch "$STORAGE/.escrita-ok" 2>/dev/null; then
    echo "[iFoodies] ERRO: não consigo escrever em $STORAGE."
    echo "[iFoodies] O container roda como uid $(id -u), gid $(id -g)."
    echo "[iFoodies] Alinhe com o dono da pasta no host pelas variáveis PUID e PGID,"
    echo "[iFoodies] ou libere a escrita na pasta montada."
    exit 1
fi
rm -f "$STORAGE/.escrita-ok"

if [ ! -f "$DB" ]; then
    touch "$DB"
    echo "[iFoodies] banco criado em $DB"
fi

php artisan migrate --force
php artisan storage:link 2>/dev/null || true

# Caches do framework: aqui valem, porque o ambiente está completo.
php artisan view:cache
php artisan filament:optimize

echo "[iFoodies] pronto."
