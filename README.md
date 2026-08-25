# 🍔 iFoodies

Plataforma completa da cantina de uma escola técnica (IFSP): app mobile para os
alunos pedirem, API para servir os dados e painel administrativo para a equipe
da cantina gerenciar produtos e pedidos.

Projeto originalmente desenvolvido para a cantina de uma escola técnica; hoje
segue como peça de portfólio.

## Estrutura (monorepo)

```
ifoodies/
├── mobile/   → App React Native / Expo (alunos fazem pedidos)
└── api/      → Backend Laravel + Filament (API + painel do staff)
```

Separados, mas juntos: cada parte tem seu próprio ciclo, mas vivem no mesmo repositório.

## 📱 mobile — App do aluno

React Native (Expo SDK 54) + TypeScript + Expo Router. Login, cardápio, carrinho,
pedidos e perfil. Identidade "Verde Vivo" (ver [DESIGN.md](DESIGN.md)):
verde kelly sobre superfícies mint, cards sem contorno, Unbounded em todos
os títulos + Figtree, filtro de categorias sobreposto, tema claro (padrão)
e escuro.

Paga por **Pix** dentro do app (AbacatePay): o QR e o copia-e-cola aparecem
na tela e a confirmação chega sozinha. Pagar é opcional — o pedido vale de
qualquer forma e dá para pagar no balcão.

Ver [mobile/README.md](mobile/README.md) para detalhes e como rodar.

## 🛠️ api — Backend

Laravel 13 + Sanctum (auth por token) + Filament (painel administrativo do staff),
banco SQLite para desenvolvimento. Expõe os endpoints consumidos pelo app
(`/api/cantina/...`: login, registro, cardápio, pedidos, perfil, pagamento) e o
**painel da cantina em `/admin`** (Filament v5, identidade Verde Vivo, navegação
no topo):

- **Painel de Controle** — fila agora, prontos para retirada, vendas de hoje e
  produtos esgotados, atualizando a cada 15s.
- **Pedidos** — a fila do balcão: status trocado direto na tabela (o app do
  aluno recebe a mudança na hora, pelo WebSocket), itens e detalhes, e
  **criação de pedido no balcão** (mesma regra do app: preço congelado,
  estoque baixado); sem editar nem apagar.
- **Registrar retirada** — o aluno mostra um código de 6 caracteres, o balcão
  digita e o pedido é encerrado. O código é de uso único e só vale com o
  pedido pronto. (O prontuário não serve como prova: é público entre os
  alunos.) Há uma saída manual, com confirmação, para celular descarregado.
- **Produtos e Categorias** — CRUD completo com preço em R$, estoque com
  alerta de esgotado e **upload de foto** (a API serve a imagem com o host da
  própria requisição, então funciona no navegador e no celular).

Só entra quem tem `is_staff` (o aluno do app é barrado no login do painel).
Login de desenvolvimento: `admin@ifoodies.test` / `password`.

## Rodando

São dois processos no backend (o WebSocket é separado, e sem ele o app cai
na recarga periódica em vez de receber os avisos na hora):

```bash
php artisan serve --host=0.0.0.0 --port=8000   # API + painel
php artisan reverb:start --host=0.0.0.0 --port=8080   # WebSocket
```

E o app:

```bash
cd mobile && npx expo start
```

### Painel lento em desenvolvimento?

O `php artisan serve` atende **uma requisição por vez** — no Windows não há
como mudar isso (`PHP_CLI_SERVER_WORKERS` depende de `fork()`). A página do
painel pede 17 arquivos, que ficam em fila. **Isso não existe em produção**,
onde o nginx serve os estáticos em paralelo.

Se incomodar localmente, sirva a pasta `api/public` por um Apache/nginx que
já esteja na máquina, numa porta própria, e use o `artisan serve` só para o
app. Medido aqui: 2.390ms → 1.602ms de carga total, e o HTML de 906ms → 257ms.

## Antes de subir para produção

O `.env.example` marca cada um destes, mas eles são fáceis de esquecer:

- `APP_DEBUG=false` e `APP_ENV=production` — com debug ligado, qualquer erro
  devolve stack trace e configuração para quem fez a requisição.
- `SESSION_SECURE_COOKIE=true` — sem isso o cookie do painel vai sem a flag
  `Secure` mesmo em HTTPS.
- `CORS_ALLOWED_ORIGINS` — troque o `*` pelos domínios reais.
- `EXPO_PUBLIC_API_URL` no build do app — **obrigatória**. O app falha ao
  subir sem ela, de propósito: antes existia um domínio fixo como reserva, e
  um build sem a variável mandaria e-mail e senha dos alunos para um endereço
  herdado de outro projeto.
- `REVERB_APP_KEY` igual nos dois lados (`api/.env` e `mobile/.env`), e o
  proxy encaminhando o WebSocket para a porta do Reverb.
- **Nenhum cron é necessário.** Quando o Pix nasce, um job com atraso é
  agendado para a hora exata em que ele expira — o prazo já é conhecido, não
  há o que varrer. Se você rodar `php artisan queue:work` (mesma natureza do
  Reverb, que já é um processo persistente), o cancelamento é pontual. Se não
  rodar, o job fica parado e quem faz a faxina é o caminho movido a tráfego.
  Os dois são seguros juntos: o primeiro cancela, o segundo não acha nada.
- Agendador (`schedule:work` ou cron) é opcional e só limpa tokens vencidos.

## Arquitetura

```
┌─────────────────────┐         ┌──────────────────────┐
│   mobile (Expo)     │         │  api /admin (Filament)│
│   alunos pedem      │         │  equipe gerencia      │
└──────────┬──────────┘         └──────────┬───────────┘
           │                               │
           └───────────────┬───────────────┘
                           ▼
                ┌─────────────────────┐
                │   api — Laravel     │
                │  auth, cardápio,    │
                │  pedidos, estoque   │
                └─────────────────────┘
```

Uma única fonte de verdade (o banco do Laravel), um único modelo de autenticação.
Produtos e pedidos vivem juntos, sem sincronização entre sistemas.
