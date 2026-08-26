# Imagem do iFoodies (API + painel /admin).
#
# Base serversideup/php: nginx + php-fpm já configurados para Laravel, rodando
# como usuário sem privilégio. Evita montar supervisor/nginx na mão, que é onde
# uma imagem PHP caseira costuma quebrar.
#
# O contexto de build é a pasta `api/` — no EasyPanel, defina o caminho de
# build como `api`, senão o COPY abaixo não acha nada.
# PHP 8.4, e não 8.3: o composer.lock foi resolvido num PHP 8.4 e travou o
# Symfony 8.1, que exige >=8.4.1. Com 8.3 o `composer install` recusa o lock
# inteiro — não é preferência, é o que o lock manda.
FROM serversideup/php:8.4-fpm-nginx-alpine

# `intl` é exigido pelo filament/support; `pdo_sqlite` é o banco deste projeto.
# Nenhum dos dois vem na imagem, e o resto do que o lock pede já está lá.
USER root
RUN install-php-extensions intl pdo_sqlite
USER www-data

WORKDIR /var/www/html

# Dependências primeiro, código depois: enquanto o composer.lock não mudar, o
# cache do Docker reaproveita esta camada e o deploy fica bem mais rápido.
COPY --chown=www-data:www-data composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

COPY --chown=www-data:www-data . .

RUN composer dump-autoload --optimize --no-dev --no-interaction

# Nenhum `php artisan` roda no build, de propósito. O EasyPanel passa as
# variáveis como build-arg, e build-arg NÃO vira variável de ambiente dentro
# de um RUN — o Laravel bootaria sem APP_KEY, sem banco e sem volume. Os
# caches do framework ficam no entrypoint, onde o ambiente existe de verdade.

# Migrations rodam no boot, não no build: no build não existem variáveis de
# ambiente nem volume, então o banco ainda não está lá.
COPY --chown=www-data:www-data docker/entrypoint.d/ /etc/entrypoint.d/
