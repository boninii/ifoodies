# Imagem do iFoodies (API + painel /admin).
#
# Base serversideup/php: nginx + php-fpm já configurados para Laravel, rodando
# como usuário sem privilégio. Evita montar supervisor/nginx na mão, que é onde
# uma imagem PHP caseira costuma quebrar.
#
# O contexto de build é a pasta `api/` — no EasyPanel, defina o caminho de
# build como `api`, senão o COPY abaixo não acha nada.
FROM serversideup/php:8.3-fpm-nginx-alpine

# SQLite não vem por padrão. Sem esta extensão o Laravel sobe e morre na
# primeira query.
USER root
RUN install-php-extensions pdo_sqlite
USER www-data

WORKDIR /var/www/html

# Dependências primeiro, código depois: enquanto o composer.lock não mudar, o
# cache do Docker reaproveita esta camada e o deploy fica bem mais rápido.
COPY --chown=www-data:www-data composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

COPY --chown=www-data:www-data . .

RUN composer dump-autoload --optimize --no-dev --no-interaction \
    # Caches do framework: em produção valem muito (é o oposto do que medimos
    # em desenvolvimento, onde o OneDrive fazia o cache custar mais do que
    # economizava). Config e rotas NÃO entram aqui de propósito — elas
    # dependem de variáveis de ambiente que só existem em tempo de execução.
    && php artisan view:cache \
    && php artisan filament:optimize

# Migrations rodam no boot, não no build: no build não existem variáveis de
# ambiente nem volume, então o banco ainda não está lá.
COPY --chown=www-data:www-data docker/entrypoint.d/ /etc/entrypoint.d/
