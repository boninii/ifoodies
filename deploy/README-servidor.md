# Subir o iFoodies no VPS

Duas metades com naturezas diferentes:

| Parte | Como sobe | Onde |
|---|---|---|
| `mobile/` (app web) | GitHub Actions → rsync → nginx estático | `ifoodies.obonini.dev.br` |
| `api/` (Laravel + Reverb) | Stack própria no EasyPanel | `api.ifoodies.obonini.dev.br` e `ws.ifoodies.obonini.dev.br` |

O app web já está automatizado: cada push que toca `mobile/` reconstrói e
publica. O que segue é a metade que precisa do painel.

---

## 1. Serviço da API (Laravel)

EasyPanel → Projeto `projects` → **+ Serviço → Aplicativo**, nome `ifoodies-api`.

**Fonte:** GitHub, repositório `boninii/ifoodies`, branch `main`.
Caminho de build: `api` (é um monorepo — sem isso ele tenta construir a raiz).

**Domínio:** `api.ifoodies.obonini.dev.br`, com HTTPS.

**Método de build:** Dockerfile (está em `api/Dockerfile`).
**Porta interna:** `8080` (a imagem base escuta nela, não na 80).

### Volume — a parte que apaga dados se esquecer

Sem volume, **todo deploy recria o container e leva o banco junto**. Uma
montagem só:

| Caminho no Host | Caminho de Montagem | Guarda |
|---|---|---|
| `/home/projects/ifoodies-api/storage` | `/var/www/html/storage` | banco SQLite, fotos dos produtos, logs, sessões |

**Por que só uma, e por que em `storage`:** o banco fica em
`storage/app/database.sqlite`, e não na pasta `database/`. Montar um volume
sobre `database/` apagaria as **migrations e seeders** do container — eles
moram lá dentro. Colocando o SQLite em `storage/`, um volume resolve tudo.

Crie a pasta antes, senão o Docker a cria como `root`.

### O que já acontece sozinho

O `docker/entrypoint.d/10-laravel.sh` roda a cada boot: cria o arquivo do banco
se não existir, aplica as migrations e faz o `storage:link`. Você não precisa
abrir console para isso.

Só o `APP_KEY` é manual, uma vez — gere e cole na variável de ambiente:

```bash
php artisan key:generate --show
```

Se quiser os dados de exemplo (14 produtos, 4 categorias, o admin), rode uma
vez no console do serviço: `php artisan db:seed --force`

---

## 2. Serviço do Reverb (WebSocket)

**Mesma imagem, comando diferente.** Novo serviço `ifoodies-ws`, mesma fonte e
mesmas variáveis de ambiente, mudando só:

- **Comando:** `php artisan reverb:start --host=0.0.0.0 --port=8080`
- **Domínio:** `ws.ifoodies.obonini.dev.br`, HTTPS, porta interna `8080`
- **Mesmo volume** da API: os dois precisam enxergar o mesmo banco
- **Importante:** o proxy precisa encaminhar o *upgrade* de WebSocket
  (`Upgrade` e `Connection`). Sem isso a conexão cai para HTTP e o handshake
  nunca completa — é a causa nº 1 de "o status não atualiza sozinho".

Sem este serviço o app **não quebra**: ele cai na recarga periódica.

---

## 3. Variáveis de ambiente (as duas services)

```env
APP_NAME=iFoodies
APP_ENV=production
APP_DEBUG=false
APP_KEY=                      # php artisan key:generate --force preenche
APP_URL=https://api.ifoodies.obonini.dev.br
APP_LOCALE=pt_BR

DB_CONNECTION=sqlite
DB_DATABASE=/var/www/html/storage/app/database.sqlite

SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true

CORS_ALLOWED_ORIGINS=https://ifoodies.obonini.dev.br
SANCTUM_EXPIRATION=43200

BROADCAST_CONNECTION=reverb
REVERB_APP_ID=                # gerar novos, NÃO reaproveitar os de desenvolvimento
REVERB_APP_KEY=
REVERB_APP_SECRET=
REVERB_HOST=ws.ifoodies.obonini.dev.br
REVERB_PORT=443
REVERB_SCHEME=https
REVERB_SERVER_HOST=0.0.0.0
REVERB_SERVER_PORT=8080

ABACATEPAY_ENABLED=true
ABACATEPAY_API_KEY=           # abc_live_… quando for cobrar de verdade
ABACATEPAY_WEBHOOK_SECRET=b5f54c2fa85fdeb1ed2d7716184867f6
ABACATEPAY_PIX_EXPIRES_IN=600

# O mailer se escolhe sozinho: MAIL_HOST preenchido vira SMTP; vazio cai no
# sendmail do sistema. MAS a imagem e Alpine e nao tem MTA — em container, sem
# MAIL_HOST o e-mail nao sai. Deixe as linhas abaixo se for usar SMTP.
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=nao-responda@ifoodies.obonini.dev.br

# Opcional: restringe o cadastro aos domínios da instituição.
REGISTER_EMAIL_DOMAINS=
```

O `REVERB_APP_KEY` que você gerar aqui precisa ir para o GitHub, senão o app
web não conecta no WebSocket:

```bash
gh secret set REVERB_APP_KEY --repo boninii/ifoodies --body "<a chave gerada>"
```

---

## 4. Webhook da AbacatePay

No painel da AbacatePay, o webhook v2 aponta para:

```
https://api.ifoodies.obonini.dev.br/api/webhooks/abacatepay?webhookSecret=b5f54c2fa85fdeb1ed2d7716184867f6
```

Eventos: `transparent.completed` e `checkout.completed`.

---

## 5. Conferir

```bash
curl -s -o /dev/null -w "app:    HTTP %{http_code}\n" https://ifoodies.obonini.dev.br/
curl -s -o /dev/null -w "api:    HTTP %{http_code}\n" https://api.ifoodies.obonini.dev.br/up
curl -s -o /dev/null -w "painel: HTTP %{http_code}\n" https://api.ifoodies.obonini.dev.br/admin/login
```

## O aperto da máquina

**1 vCPU e ~2 GB livres**, compartilhados com o site de produção de um colega.
Cada stack consome 300–700 MB. Manter o SQLite economiza um serviço inteiro de
banco. A CPU única é o gargalo real, não a RAM.
