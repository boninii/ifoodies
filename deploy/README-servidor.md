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

### Volumes — a parte que apaga dados se esquecer

Sem volume, **todo deploy recria o container e leva o banco junto**. Duas
montagens obrigatórias:

| Caminho no Host | Caminho de Montagem | Guarda |
|---|---|---|
| `/home/projects/ifoodies-api/database` | `/app/database` | o banco SQLite |
| `/home/projects/ifoodies-api/storage` | `/app/storage` | fotos dos produtos, logs, sessões |

Crie as pastas antes, senão o Docker as cria como `root`.

### Depois do primeiro deploy, rodar uma vez (console do serviço)

```bash
php artisan key:generate --force
php artisan migrate --force
php artisan db:seed --force        # só se quiser os dados de exemplo
php artisan storage:link
```

---

## 2. Serviço do Reverb (WebSocket)

**Mesma imagem, comando diferente.** Novo serviço `ifoodies-ws`, mesma fonte e
mesmas variáveis de ambiente, mudando só:

- **Comando:** `php artisan reverb:start --host=0.0.0.0 --port=8080`
- **Domínio:** `ws.ifoodies.obonini.dev.br`, HTTPS, porta interna `8080`
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

# Sem SMTP o código de recuperação de senha NUNCA chega ao aluno.
MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=

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
